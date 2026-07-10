---
name: ai-forge-create
description: "Create a new skill (SKILL.md), agent definition, or instruction file via discovery recap, pattern selection, knowledge delta discipline, ai-forge-judge + ai-forge-apply quality gate. Use when converting ad-hoc knowledge into a reusable skill, scaffolding an agent for Claude Code, GitHub Copilot, OpenAI Codex, or Google Gemini, or creating instruction files for glob-pattern matching. Don't use for updating existing artifacts — use ai-forge-update for that. Triggers are create a skill, write a skill, new skill, SKILL.md, build a skill, create an agent, new agent, scaffold an agent."
---

# AI Forge Create

Write skills and agents that score ≥B on ai-forge-judge out of the box. Every section must earn its tokens.

---

## Phase 1 — Discovery

Build understanding through a running recap. Ask questions to fill gaps; after each exchange, show the current recap:

```text
## Discovery Recap

**Domain:** [what the skill/agent covers, or "unknown"]
**Artifact type:** [Skill / Agent / Instruction file]
**Platform:** [Claude Code / GitHub Copilot / OpenAI Codex / Google Gemini — infer from file path: .claude/ → Claude Code, .github/ → Copilot, .codex/ → Codex, .gemini/ → Gemini]
**Decisions:** [non-obvious choices the agent must make, or "unknown"]
**Failure modes:** [what breaks without this artifact, or "unknown"]
**Audience:** [fragile/creative output, or "inferred: ..."]
**Size:** [reference files needed, or "inferred: self-contained"]
```

Then ask: `(a)ccept / (r)evise / (q)uit`

- `a` — recap is complete; proceed to Phase 2
- `r` — user adds or corrects; update recap and loop
- `q` — abort

Do not proceed to Phase 2 until the user accepts the recap. Domain, artifact type, and failure modes must be filled before accepting. **Platform must also be resolved** — it drives frontmatter schema, file location, and invocation constraints for both agents and skills.

> **Porting an existing artifact to another platform?** That's a *conversion*, not authoring — read [`references/conversion-guide.md`](references/conversion-guide.md) and transform by hand. Conversion is not automated.

---

## Phase 2 — Pattern Selection

**For Skills**: MANDATORY — READ [`references/skill-patterns.md`](references/skill-patterns.md) before selecting a pattern. Do NOT load this file for agents.

**For Agents**: MANDATORY — READ [`references/agent-patterns.md`](references/agent-patterns.md) before selecting a pattern. Do NOT load this file for skills.

Select one pattern. State your choice and the one-line reason before drafting. If no pattern clearly fits, default to Process and note: "Pattern: Process (closest fit — no exact match for this domain)."

---

## Phase 3 — Draft

Write the description before the body. Draft the body around what the description promises.

Write to earn tokens. For every **sentence**, ask: **"Does Claude already know this?"**

- If yes → delete it
- If "it's a useful reminder" → one line max, then move on
- If no → expand it; this is the value

Before writing each line, ask: **"What failure mode does this prevent?"** If you can't answer, delete it.

### Leading words

A _leading word_ is a compact pretrained concept that anchors a region of behaviour — e.g. _fog of war_, _tracer bullets_, _red loop_. Repeat the token, not the meaning. Each repetition recruits the model's existing priors and accumulates a distributed definition without spending definition tokens.

Leading words serve double duty: in the body they anchor execution (same behaviour each run); in the description they anchor invocation (a description that shares a word with the user's prompt triggers more reliably — use the exact words you would type when triggering the skill).

Hunt for collapses: "fast, deterministic, low-overhead" → _tight_. Every collapse is tokens freed and the agent's hook sharpened.

### Description requirements (THE most critical field)

- Answers WHAT (what does it do?)
- Answers WHEN (trigger scenarios — "Use when...", "Trigger phrases:")
- Contains searchable KEYWORDS (domain terms, file extensions, action verbs)
- Max 1024 chars (hard limit); concise and actionable for agents
- **Single-line value** — NEVER use YAML multiline (`|` or `>`)
- **No colons** — rephrase "X: Y" as "X — Y" or "X (Y)"; unescaped colons break frontmatter
- **No XML angle brackets** (`<`, `>`) anywhere in frontmatter — enables prompt injection
- **Third-person imperative only** — "Creates…", "Analyzes…", not "I can…", "You can…", or "Helps with…"; first/second-person breaks discovery
- **Negative triggers** — include "Don't use for [anti-scenario]" to prevent mis-activation on adjacent tasks
- One trigger per distinct scenario — synonyms that rename the same branch are duplication
- Model-invoked vs user-invoked: if `disable-model-invocation: true`, description is human-facing only — strip trigger phrasing, no KEYWORDS needed

### Degrees of freedom

Match specificity to task fragility:

| Freedom | Form | When |
|---------|------|------|
| High | Text instructions | Multiple valid approaches; context decides |
| Medium | Pseudocode or parameterised scripts | Preferred pattern with acceptable variation |
| Low | Exact scripts, no parameters | Fragile ops, must-follow sequence, data migrations |

A code review needs High. A database migration needs Low.

### Completion criteria (step-based skills)

Every step ends on a completion criterion — the condition that tells the agent the work is done. Make it **checkable** (can the agent tell done from not-done?) and **exhaustive** ("every modified file reviewed", not "produce a list"). A vague criterion invites premature completion: visible later steps pull the agent forward before the current one is finished. If a criterion is irreducibly fuzzy and rushing is observed, split the sequence — hide later steps in a separate Phase or file so they are not yet in context.

### Line limits

| Artifact | Body limit | Overflow strategy |
|----------|-----------|-------------------|
| Skill SKILL.md | 200 lines | Split to `references/` with MANDATORY READ triggers |
| Agent .agent.md | 300 lines | No overflow — must be self-contained |
| Instruction file | 150 lines | Keep lean — loads eagerly on glob match |

### NEVER rules format — every NEVER must have

```text
- **NEVER [specific construct/pattern]**
  **Instead:** [concrete alternative]
  **Why:** [non-obvious failure mode this avoids]
```

Vague warnings ("be careful", "avoid errors") are prohibited.

**For Skills** — MANDATORY READ [`references/skills-taxonomy.md`](references/skills-taxonomy.md) for: directory structure, progressive disclosure, scripts guidelines, and skill frontmatter optional fields. Do NOT load this file for agents.

**For Agents** — MANDATORY READ [`references/agents-taxonomy.md`](references/agents-taxonomy.md) for: per-platform file naming, folder structure, frontmatter schema, tool access, model IDs, invocation mechanics, and key constraints. Covers Claude Code, GitHub Copilot, OpenAI Codex, and Google Gemini. Do NOT load this file for skills.

---

## Phase 4 — Self-Evaluate

Invoke `ai-forge-judge` on the draft. Target: ≥B (80%+).

If judge returns zero improvements (grade A, empty list), skip ai-forge-apply and proceed to Phase 5: "Judge returned A with no improvements — proceeding to review offer."

Otherwise, invoke `ai-forge-apply` on the numbered improvements list. Do not apply fixes manually.

If ai-forge-apply stalls on a dimension (same item rejected after 3 revisions), surface it to the user: "Stuck on [dimension] — here's what I tried. Options: accept the current draft, revise the scope, or skip."

---

## Phase 5 — Review Offer

After Phase 4 completes, offer the interactive design review:

> "Want me to stress-test this design? Say 'review this' to run `ai-forge-review`."

This is optional but recommended for agents and complex skills. If the user doesn't respond, proceed to Phase 6.

---

## Phase 6 — Test (optional)

After Phase 5 resolves, offer behavioral validation:

> "Want to verify this works end-to-end? Say 'test this' to run `ai-forge-eval` with 2–3 sample prompts."

`ai-forge-eval` spawns parallel with-artifact vs baseline agents, grades outputs against assertions, and shows a pass_rate delta. Recommended for Process and Tool pattern artifacts; optional for Mindset/Navigation/Philosophy.

---

## Review Checklist (before finalizing)

MANDATORY — run `node scripts/validate-metadata.cjs --name "<name>" --description "<desc>"` before Phase 4. Cross-check against [`references/skill-checklist.md`](references/skill-checklist.md). If any item fails, fix before submitting to `ai-forge-judge`.

---

## NEVER

- **NEVER write a section that restates Claude defaults** ("write clean code", "handle errors", "be helpful")
  **Instead:** Ask: "Would Claude do this without being told?" If yes, delete it.
  **Why:** Default restatements dilute expert signal and train authors that padding is acceptable.

- **NEVER add a NEVER rule without WHY and INSTEAD**
  **Instead:** Complete the three-part format before moving on.
  **Why:** A prohibition without an alternative gets violated when the obvious path is blocked.

- **NEVER dump all content in a single file**
  **Instead:** Keep skill body under 200 lines; move detail to `references/` with MANDATORY READ triggers.
  **Why:** A bloated body loads all at once on every invocation — drowns agent in irrelevant content.

- **NEVER skip Phase 4** (ai-forge-judge self-eval)
  **Instead:** Run it even if the draft feels good.
  **Why:** Skills that skip self-eval consistently have U1 or U3 gaps that aren't obvious to the author.

- **NEVER manually apply ai-forge-judge findings one-by-one**
  **Instead:** Invoke `ai-forge-apply` on the numbered improvements list.
  **Why:** Manual application skips the approval loop and defeats the purpose of the numbered format.

- **NEVER add README.md, CHANGELOG.md, or documentation about the artifact itself**
  **Instead:** Include only what the agent needs to perform the task.
  **Why:** Meta-documentation is never loaded during execution — it wastes directory space.

- **NEVER write a vague description without explicit WHEN triggers and searchable keywords**
  **Instead:** Include "Use when...", specific scenarios, and domain-specific terms.
  **Why:** The description is the only thing the agent sees when deciding which skill to load — poor description = skill never activates.
