# AGENTS.md

## Mission

This repo publishes the `ai-forge` skill pack: eight skills covering the lifecycle of an AI skill or agent definition, create, judge, review, apply, evaluate, recap, update, and audit. There is no build, no tests, no runtime of its own. The deliverable is the contents of `skills/*`, each copied in from a source repo (Orakl) where they are used and refined, then published here for anyone to install. Changes should be judged by: would a stranger who installs one of these skills into an unrelated project get correct, generic guidance out of it?

## Layout convention

- One directory per skill under `skills/<name>/`, `name:` in frontmatter matching the directory name exactly.
- Each skill's full directory ships as-is: `SKILL.md` plus any `references/`, `assets/`, `agents/`, or `scripts/` it depends on. Don't split a skill across a partial copy.
- Two skills ship a `scripts/` directory: `ai-forge-create/scripts/validate-metadata.cjs` and `ai-forge-eval/scripts/aggregate-benchmark.cjs`. Both are zero-dependency, read-input/print-output Node scripts with no network calls. See [`SAFETY.md`](SAFETY.md) for the current, verified description of each.

## Judgment boundaries

NEVER:
- Never let a copied skill's content leak repo-specific references back to Orakl (or any other single source project). A published skill needs to read as generic guidance, not one project's internal notes.
- Never remove a skill without asking first: the eight here form one lifecycle, and removing one leaves a gap other skills' cross-references (e.g. `ai-forge-audit` requiring `ai-forge-judge`) assume is filled.

ASK:
- Ask before changing the license or copyright holder.
- Ask before adding a ninth skill that doesn't fit the create/judge/review/apply/eval/recap/update/audit lifecycle the other eight cover.

ALWAYS:
- When a skill's `scripts/` directory gains, loses, or changes what a script does: update [`SAFETY.md`](SAFETY.md) in the same change, based on actually reading the script, not assuming its behavior is unchanged.
- When re-syncing a skill from its source, re-run the orakl-leakage grep (`grep -rni "orakl"` across `skills/`) before publishing, and flag any hits rather than silently editing them out.
- When adding, removing, or renaming a skill: update the table in [`README.md`](README.md) in the same change.

## Adding a skill

1. Copy the full skill directory from its source, not just `SKILL.md`.
2. Grep the copy for source-repo-specific leakage (project name, absolute paths) before publishing.
3. If it ships a `scripts/` directory, read the script and add its description to `SAFETY.md`, plus a line in `README.md`'s Safety section.
4. Add a row to the table in `README.md`.
