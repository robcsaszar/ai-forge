# Contributing

Thanks for considering a contribution to `ai-forge`. This is a pack of eight skills covering the lifecycle of an AI skill or agent definition. Contributions are welcome, but the bar is "does this fit the pack's lifecycle," not "is this a good idea in general."

## Before you start

- **Bug in an existing skill?** Open an issue with a concrete example: the input you gave it, what it produced, and what you expected instead.
- **New skill idea?** Open an issue first. The eight skills here cover one lifecycle (create, judge, review, apply, eval, recap, update, audit); a new skill needs to fit that lifecycle, not just be generally useful for working with prompts.
- **Design questions** are worth raising as an issue before writing code. See `AGENTS.md` for the boundaries already decided.

## Making a change

1. Fork and branch from `main`.
2. If you're editing an existing skill, keep its overall phase structure intact unless you're proposing a structural change (raise that as an issue first). Several skills cross-reference each other by name (`ai-forge-audit` requires `ai-forge-judge`, `ai-forge-apply` is the typical next step after `ai-forge-judge` or `ai-forge-create`); check for those references before renaming anything.
3. If your change touches `ai-forge-create/scripts/validate-metadata.cjs` or `ai-forge-eval/scripts/aggregate-benchmark.cjs`, update `SAFETY.md` to match the script's actual new behavior in the same PR.
4. If you're adding a new skill, follow the layout convention in `AGENTS.md`.
5. Update `README.md`'s skill table and, if you added a script, `SAFETY.md`, in the same change.

## Quality bar

Every skill here should keep parity with how it's actually used and refined in its source project: if you're proposing a change, consider whether it would also make sense upstream, not just in this published copy. Each skill should also read as generic, source-repo-agnostic guidance, no absolute paths, no leaked internal references. This isn't enforced by CI (the pack itself has none, by design), but a PR that introduces project-specific leakage or breaks a skill's cross-references to another skill in the pack will be asked to fix that before merge.

## What won't be merged

- Skills that require a specific tech stack or framework; these eight are intentionally agent/skill-format-agnostic.
- Source-repo-specific assumptions leaking into a skill's guidance.
- A script added to a skill's `scripts/` directory without a corresponding `SAFETY.md` update in the same PR.

## Questions

Open an issue. There's no separate chat or forum for this project.
