# AGENTS.md

## Mission

This repo publishes the `ai-forge` skill pack: eight skills covering the lifecycle of an AI skill or agent definition, create, judge, review, apply, evaluate, recap, update, and audit. There is no build, no tests, no runtime of its own. The deliverable is the contents of `skills/*`, each copied in from a source repo (Orakl) where they are used and refined, then published here for anyone to install. Changes should be judged by: would a stranger who installs one of these skills into an unrelated project get correct, generic guidance out of it?

## Layout convention

- One directory per skill under `skills/<name>/`, `name:` in frontmatter matching the directory name exactly.
- Each skill's full directory ships as-is: `SKILL.md` plus any `references/`, `assets/`, `agents/`, `evals/`, or `scripts/` it depends on. Don't split a skill across a partial copy.
- Three skills ship a `scripts/` directory: `ai-forge-create/scripts/validate-metadata.cjs`, `ai-forge-audit/scripts/check-ecosystem.cjs`, and `ai-forge-eval/scripts/aggregate-benchmark.cjs`. All are zero-dependency Node scripts with no network calls. See [`SAFETY.md`](SAFETY.md) for the current, verified description of each.
- Skill bodies stay under 200 lines and ~1,800 words. Reference files over 300 lines carry a `## Contents` TOC.

## Judgment boundaries

NEVER:
- Never let a copied skill's content leak repo-specific references back to Orakl (or any other single source project). A published skill needs to read as generic guidance, not one project's internal notes.
- Never remove a skill without asking first: the eight here form one lifecycle, and removing one leaves a gap other skills' cross-references (e.g. `ai-forge-audit` requiring `ai-forge-judge`) assume is filled.

ASK:
- Ask before changing the license or copyright holder.
- Ask before adding a ninth skill that doesn't fit the create/judge/review/apply/eval/recap/update/audit lifecycle the other eight cover.

ALWAYS:
- When a skill's `scripts/` directory gains, loses, or changes what a script does: update [`SAFETY.md`](SAFETY.md) in the same change, based on actually reading the script, not assuming its behavior is unchanged.
- When adding, removing, or renaming a skill: update the table in [`README.md`](README.md) in the same change.
- Before publishing, run the three pre-publish checks below. All three must be clean.

## Pre-publish checks

A single project-name grep is not enough — leakage arrives as brand names, internal type names, and ticket prefixes that share no substring with the project. Check for the *shapes* of leakage, not one word:

```sh
# 1. Source-project leakage. Extend the alternation when a new source project appears;
#    the generic patterns catch what a name-based grep never will.
grep -rnE "[Oo]rakl|mandator|MandatorSettings" skills/                 # known markers
grep -rnE "\b[A-Z]{2,}-[0-9]{4,}\b" skills/                            # ticket IDs (ACME-12345)
grep -rnE "/(Users|home)/[a-z]" skills/                                # absolute home paths
grep -rnE "\b(BMW|MINI|Rolls-Royce)\b" skills/                         # brand names
# Any hit that is a real example is fine; any hit naming a specific company,
# internal type, or private repo is not. Flag it — don't silently rewrite it.

# 2. The pack passes its own validator.
for d in skills/*/; do n=$(basename "$d"); desc=$(sed -n '3p' "$d/SKILL.md" | sed 's/^description: //'); \
  node skills/ai-forge-create/scripts/validate-metadata.cjs --name "$n" --description "$desc" || echo "FAIL $n"; done

# 3. The pack passes its own coherence check.
node skills/ai-forge-audit/scripts/check-ecosystem.cjs --roots skills --strict
```

A pack that grades other people's skills should pass its own tooling. When check 2 or 3 fails, the honest options are to fix the pack or to fix the rule — never to exempt ourselves from it.

## Adding a skill

1. Copy the full skill directory from its source, not just `SKILL.md`.
2. Run the pre-publish checks above.
3. If it ships a `scripts/` directory, read the script and add its description to `SAFETY.md`, plus a line in `README.md`'s Safety section.
4. Add a row to the table in `README.md`.

## Releasing

Releases are cut by the **Release** workflow (`.github/workflows/release.yml`), never by hand. It is a manual `workflow_dispatch` with one input, `tag`, and it releases the commit at the tip of the branch it is run on. Run it on `main`.

The workflow, in order:
1. Rejects a tag that is not `vX.Y.Z`, or that already exists.
2. Fails unless `version` in `.claude-plugin/plugin.json` and `plugins[0].version` in `.claude-plugin/marketplace.json` both equal `X.Y.Z`.
3. Takes the `## [X.Y.Z]` block from `CHANGELOG.md` as the release notes, and fails if there is none.
4. Creates the tag at the checked-out commit and publishes the GitHub release with those notes.

Nothing is created until every check passes, so a failed run leaves nothing to clean up.

To prepare a release, in one PR:
- Set the same new version in `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json`.
- Add a `## [X.Y.Z] - YYYY-MM-DD` block at the top of `CHANGELOG.md`, and its `[X.Y.Z]: …` link reference at the bottom.
- Merge to `main`.

Then run the workflow on `main` with `tag=vX.Y.Z`, from the Actions tab (**Release → Run workflow**) or from a shell:

```sh
gh workflow run release.yml --ref main -f tag=vX.Y.Z
```

Afterwards, confirm the release exists and its notes match the changelog block.

NEVER:
- Never push a tag or create a release outside the workflow. A hand-made tag makes the workflow refuse that version, and a hand-written release skips the changelog and version checks.
- Never work around a failed run by hand-writing notes or skipping a check. Fix the changelog or the manifests, merge, and re-run.
