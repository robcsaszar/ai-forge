# Changelog

All notable changes to this project are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows [SemVer](https://semver.org/).

## [0.8.0] - 2026-09-22

### Fixed

- `ai-forge-judge`: the description colon rule was wrong. It auto-failed S1 on any colon, but a colon inside a quoted scalar (`description: "… animate:flip …"`) is valid YAML and the agentskills spec imposes no colon rule of its own. Only a bare `key: value` shape in an *unquoted* value breaks parsing, and only that is now an auto-fail. The old rule mis-graded correct skills.
- `ai-forge-judge`, `ai-forge-review`: `evals/` and `benchmarks/` were flagged as skill-root spec violations. A purpose-named *directory* is not a stray file; only non-`SKILL.md` files at the root are. Both now say so explicitly, so an eval suite no longer costs a skill points.
- `ai-forge-update`: Phase 3 invoked `ai-forge-apply` unconditionally while the judge's report already ended in its own `(y)es / (n)o` prompt, so the user was asked twice. Phase 3 now honours that prompt and defines the `(n)` branch.
- `ai-forge-eval`: an agent's result and its `<usage>` block can arrive in two separate messages. A hand-back without usage was being treated as permanently missing data; it is now recorded as `null` and overwritten if a later notification for the same task id carries the block.

### Changed

- `ai-forge-apply`: one decision per turn. The uncommitted-changes warning, the git opt-in, the branch question, and `(A)/(s)` are four turns rather than one line — a human facing two prompts answers both in one reply ("n A"), which the skill had no defined parse for. Added as a NEVER with that rationale.
- `ai-forge-apply`: the git branch decision moved to `references/git.md`, loaded only on `(c)ommit`. It also gains an escape hatch — a repo whose own convention puts AI work on the default branch commits there instead of forcing an `ai/*` branch.
- `ai-forge-apply`: `(r)evise` now collects one sentence about what was wrong with *the change*, not with the finding.
- `ai-forge-judge`: dimension U3 renamed `Anti-Pattern Quality` → `Constraint Quality`; the report footer is now the literal prompt `Step through these with ai-forge-apply? (y)es / (n)o`.
- `ai-forge-eval`: trigger validation runs each query twice, with a third run only where the two disagree. A measured 12-query set returned unanimous judgments on all 24 runs, so a blanket third run mostly re-buys an answer already in hand.
- `ai-forge-create`: `benchmarks/` added to the directory taxonomy for committed trend baselines.

### Added

- `ai-forge-apply`: `references/git.md`.
- `ai-forge-eval`: `agents/refiner.md` now states that it has not read the artifact, so every improvement must name a behaviour visible in the outputs — never structure, ordering, or prominence. A caller who knows the file discards the whole list when one item is invented.
## [0.7.0] - 2026-08-14

### Fixed

- `ai-forge-apply`: description advertised "commits after each approved item", contradicting the body's NEVER rules, which forbid per-item commits and require a single opt-in commit after the loop. The description is the only text the router sees, so the contradiction was user-visible.
- `ai-forge-update`: NEVER #5 ("never proceed to Phase 3 if apply applied zero changes") read as forbidding the zero-findings branch that Phase 3 itself defines. Scoped the rule to Phase 2's apply and stated that it does not govern Phase 3's own exit.

### Changed

- `ai-forge-create`, `ai-forge-eval`, `ai-forge-recap`, `ai-forge-review`, `ai-forge-update`: descriptions rewritten as trigger conditions rather than workflow summaries, so the router cannot act on the description in place of loading the body.
- `ai-forge-create`, `ai-forge-eval`: added failure branches for their validator scripts. A validator that runs and rejects still blocks; a validator that cannot run (missing `node`, missing script, usage error) now degrades with a recorded `⚠ unvalidated` caveat instead of being an undefined state. Both cases currently exit `1`, so the branches key on the error text — giving the scripts a distinct exit code remains open.
- `ai-forge-audit`: already had a failure path for `check-ecosystem.cjs`; it now stamps `⚠ roster-level checks skipped` on the report rather than only noting the skip, since the six roster checks are precisely what per-artifact grades cannot see.
- `ai-forge-create`: `assets/SKILL.template.md` is now referenced from the body; it was previously unreachable.

## [0.6.2] - 2026-08-07

### Changed

- `ai-forge-audit`, `ai-forge-create`, `ai-forge-eval`: reformatted `check-ecosystem.cjs`, `validate-metadata.cjs`, and `aggregate-benchmark.cjs` to single-quote/no-semicolon-trailing-comma style with lint-disable annotations; no behavioral changes.

## [0.6.1] - 2026-08-07

### Security

- `ai-forge-judge`: documented that WebFetch results (e.g. the agentskills.io spec) must be treated as inert reference text, never as instructions — mitigates indirect prompt injection risk (skills.sh audit finding W011).
- `ai-forge-audit`: documented that `check-ecosystem.cjs` is local and read-only — no network access, no subprocess spawning, no writes outside stdout — addressing a "delegated execution / transitive trust" flag from the skills.sh audit.

## [0.6.0] - 2026-08-01

### Added

- `ai-forge-create`: Phase 0 dedup check and Phase 1b baseline probe — measure what the agent does *without* the artifact before drafting, so observed failures drive the body instead of asserted ones. New `references/baseline-probe.md` carries the protocol and a failure-form matching table (guidance shape follows failure type).
- `ai-forge-create`: `references/drafting-craft.md` for leading words, degrees of freedom, completion criteria, and the constraint format.
- `ai-forge-eval`: Phase 0 loads or writes a persisted `evals/evals.json`, so a suite survives the conversation and can be re-run as a regression test. New `references/eval-suite.md` documents the format, trigger protocol, and pressure escalation.
- `ai-forge-eval`: Phase 3b human review step with a self-contained `assets/eval-review.html` template; Phase 6 trigger check reporting recall and precision against a 60/40 train/held-out split.
- `ai-forge-eval`: assertion discrimination — classifies each assertion by whether it distinguishes the with-artifact arm from baseline, so a suite of assertions that pass either way stops reading as a healthy pass rate.
- `ai-forge-audit`: Phase 0 ecosystem coherence pass and `scripts/check-ecosystem.cjs` — trigger collisions, duplicate and shadowed names, stale links, orphaned references, dated model pins, and word budgets across a whole roster.
- `ai-forge-review`: refutation pass with a severity-ordered charge and blocker/should-fix/note labels.
- `ai-forge-update`: `references/iteration-guide.md` with iterate-vs-redesign sizing and a signal-to-fix table; conversion now runs a field-disposition report and routes judgment calls through `ai-forge-apply`.
- `ai-forge-create`: `validate-metadata.cjs` gains `--target` (per-platform disposition report), `--when-to-use`, a dated-model-ID check, and the 1,536-char combined listing cap.
- Documentation for the full Claude Code SKILL.md frontmatter field set, skill-scoped hooks (including the exit-code-1-does-not-block trap), the script-vs-prose decision, and domain-variant reference organization.

### Changed

- `ai-forge-judge`: U3 renamed to Constraint Quality and rescored. It now grades whether constraints are justified, explained, and load-bearing rather than whether a NEVER list exists — a constraint carried by explained reasoning scores higher than the same constraint asserted, and prohibition bloat is penalized.
- Reference-file TOC threshold raised from 100 to 300 lines, matching the spec.
- Skill body budget stated as 200 lines *and* ~1,800 words, set to bind at the same point.

### Fixed

- Three shipped skills failed this pack's own metadata validator (unescaped colon in description).
- `ai-forge-review/assets/AI-SPEC-TEMPLATE.md` carried source-project specifics; generalized, and given requirement traceability and a decisions table.
- `AGENTS.md` leakage check widened from a single project-name grep to cover ticket IDs, absolute home paths, and brand names, plus self-conformance checks.

## [0.5.0] - 2026-07-10

[0.8.0]: https://github.com/robcsaszar/ai-forge/releases/tag/v0.8.0
[0.7.0]: https://github.com/robcsaszar/ai-forge/releases/tag/v0.7.0
[0.6.2]: https://github.com/robcsaszar/ai-forge/releases/tag/v0.6.2
[0.6.1]: https://github.com/robcsaszar/ai-forge/releases/tag/v0.6.1
[0.6.0]: https://github.com/robcsaszar/ai-forge/releases/tag/v0.6.0
[0.5.0]: https://github.com/robcsaszar/ai-forge/releases/tag/v0.5.0
