---
name: ai-forge-eval
description: "Behavioral eval for skills and agents — spawn parallel with-artifact vs baseline agents, grade outputs with assertions, compare via blind A/B, analyze wins/losses. Benchmark mode adds repeated trials (mean plus std-dev), a persisted trend store, and regression gating vs the last run. Use when verifying a skill or agent actually works in practice beyond rubric scoring. Triggers are test this skill, test this agent, eval this, does this skill work, behavioral eval, run eval, benchmark, benchmark this skill, track regression, verify outputs, does this agent work. Don't use for rubric-only scoring — that's ai-forge-judge."
---

# AI Forge Eval

Behavioral validation for skills and agents. Rubric scoring (ai-forge-judge) tells you if an artifact is well-written. Eval tells you if it works.

Works for SKILL.md (skills) and .agent.md (agents). Same 5-phase flow; Phase 2 setup differs by artifact type.

---

## Phase 1 — Write Evals

Write 2–3 eval cases. Each eval is a realistic prompt drawn from the artifact's stated trigger scenarios plus 3–5 assertions.

**For skills**: prompts that should activate the skill naturally. Assertions check skill-specific behaviors (e.g. "output includes a Phase 1 recap", "NEVER rule format has WHY and INSTEAD").

**For agents**: prompts covering the agent's stated scope. Assertions check observable behaviors — files created, tools called, tone constraints, scope limits (e.g. "did not modify files outside src/lib/", "opened a PR", "commit message starts with 'refactor:'").

**Assertion rules**:

- Checkable: the assayer can verify from the output alone
- Specific: "output includes 'Phase 1' header" beats "output is well-structured"
- Falsifiable: must be possible to fail

Record evals:

```text
Eval 1: <prompt>
Expectations:
- <assertion 1>
- <assertion 2>
- <assertion 3>
```

---

## Phase 2 — Spawn Parallel

For each eval, spawn the **with-artifact and baseline runs in the same message** (never sequentially). In benchmark mode this becomes N trial-pairs per eval — see Benchmark mode below.

**With-artifact run**: give it the eval prompt. For skills: add "Use the `<skill-name>` skill for this task." For agents: paste the agent's full instructions as the system context.

**Baseline run**: same eval prompt, no skill instruction, no agent context. Plain assistant response.

**Capture immediately on completion**: when each task notification arrives, read its `<usage>` block and record:

- Which run (with / baseline), plus the trial index in benchmark mode
- `duration_ms` and `subagent_tokens` from the notification's `<usage>` block — structured and exact, not estimated
- If a notification carries no `<usage>` block, record `null` for that field; never substitute a wall-clock guess

Usage data exists only in the notification — capture on arrival, not after both complete.

Store per eval:

```text
Eval 1:
  with_artifact: [output text]
  baseline: [output text]
  duration_ms: { with: N, baseline: N }
  tokens: { with: N, baseline: N }
```

---

## Phase 3 — Grade

MANDATORY READ: [`agents/assayer.md`](agents/assayer.md)

For each eval, invoke assayer on both outputs. Pass:

```text
Output: <output text>
Expectations:
- <assertion 1>
- <assertion 2>
```

Assayer returns per expectation:

```json
{ "text": "...", "passed": true, "evidence": "..." }
```

Compute `pass_rate = passed / total` per run.
Compute `delta = with_artifact.pass_rate - baseline.pass_rate`.

---

## Phase 4 — Compare (optional)

MANDATORY READ: [`agents/arbiter.md`](agents/arbiter.md) — load only when Phase 4 runs.

**Run Phase 4 when**: delta > 0.1 on any eval, or pass_rates conflict across evals.

**Skip when**: pass_rates are identical, or user requested grades only.

Arbiter input: Output A (unlabeled), Output B (unlabeled), expectations list. Record which was which for Phase 5.

Arbiter returns: content score (1–5), structure score (1–5), winner (A/B/tie), rationale, strengths/weaknesses per side.

---

## Phase 5 — Analyze + Report

MANDATORY READ: [`agents/refiner.md`](agents/refiner.md) — load only if Phase 4 ran.

If Phase 4 was skipped: go directly to benchmark table.

Refiner input: arbiter output + label mapping `{ "A": "with_artifact", "B": "baseline" }` (or reversed). Refiner explains why winner beat loser and surfaces 1–3 prioritized improvements.

**Render benchmark table**:

```text
## Eval Results — <artifact-name>

| Eval | with_artifact | baseline | delta | duration_ms (with / base) |
|------|---------------|----------|-------|---------------------------|
| 1    | 4/5 (80%)     | 2/5 (40%)| +40%  | 12000 / 9000              |
| 2    | 5/5 (100%)    | 3/5 (60%)| +40%  | 14000 / 8000              |
| Avg  | 90%           | 50%      | +40%  |                           |
```

If refiner ran, append improvement suggestions beneath the table.

If delta is negative on any eval, flag: "Artifact may be hurting performance — review trigger phrasing or scope constraints."

---

## Benchmark mode

Trigger when the user asks to benchmark, track regression, or gate on trend. Benchmark mode extends the five phases with repeated trials and a persisted trend store.

MANDATORY READ: [`references/benchmarking.md`](references/benchmarking.md) before running — trial protocol, aggregation formulas, gating thresholds, and the trial-results + `benchmark.json` schemas live there. Do NOT load it for a plain single-run eval.

- **Trials** — run each eval N times (default 3). Per eval, spawn all N trial-pairs (2N subagents) in ONE message, drain that eval's notifications capturing `<usage>` per Phase 2, then move to the next eval. Never spawn every eval's trials at once.
- **Aggregate** — write the per-trial results to a scratch JSON, then run `node scripts/aggregate-benchmark.cjs --trials <scratch.json> --prior benchmarks/<artifact-name>.json --artifact <path>`. It returns per-eval mean/std-dev, flaky flags, deltas vs the prior run, and a gate verdict. When the artifact's content hash differs from the prior run, deltas are labelled "artifact changed" — read them as your edits, not drift.
- **Persist** — save the returned payload to `benchmarks/<artifact-name>.json` (committed) as the new trend baseline.
- **Report** — render the Phase 5 table with mean±std-dev columns (`with mean±std`, `baseline mean±std`, `delta`, `flaky`) and append the gate verdict. On gate fail, verdict is "regressed — not ready".

---

## NEVER

- **NEVER spawn a trial's with_artifact and baseline runs sequentially**
  **Instead:** Both arms of each trial in the same message. In benchmark mode, all N trial-pairs for one eval go in one message; different evals may batch sequentially.
  **Why:** Sequential arms serialize parallel feedback; but spawning every eval's trials at once floods notifications and makes per-arrival `<usage>` capture unreliable.

- **NEVER defer usage capture until other runs complete**
  **Instead:** Read each notification's `<usage>` block (`duration_ms`, `subagent_tokens`) the moment it arrives.
  **Why:** The `<usage>` data exists only at notification time and cannot be reconstructed afterward.

- **NEVER report a single trial as a benchmark**
  **Instead:** Run at least N=3 trials so mean and std-dev are meaningful.
  **Why:** A lone pass_rate looks precise but hides flakiness — a skill that truly passes a third of the time can read 100% or 0% on one trial.

- **NEVER write subjective assertions** ("output is clear", "well-formatted", "thorough")
  **Instead:** Verifiable from the text: "output includes 'Phase 1' heading", "no NEVER rule missing a WHY clause"
  **Why:** Subjective assertions give the assayer no ground truth; pass/fail becomes arbitrary and unrepeatable.

- **NEVER use different prompts for the with and baseline runs**
  **Instead:** Identical prompt — only the artifact instruction differs.
  **Why:** Prompt variation confounds the delta; it measures prompt quality, not artifact effect.

- **NEVER accept assayer output with non-standard field names**
  **Instead:** Require `text`, `passed`, `evidence` exactly — reject `name`, `met`, `details`, or others.
  **Why:** Phase 5 aggregation depends on exact field names; silently wrong names produce wrong pass_rates.
