# Safety notes

Three skills in this pack ship a small helper script. All are zero-dependency Node scripts (no npm packages, only Node's built-in `fs` and `crypto` modules where used) that read local input and print a result to stdout or stderr. None makes a network call. This document describes what each one does.

## `ai-forge-create/scripts/validate-metadata.cjs`

Invoked as `node scripts/validate-metadata.cjs --name "<name>" --description "<desc>" [--when-to-use "<text>"] [--target <platform>] [--artifact skill|agent]`. Validates a proposed skill or agent's frontmatter against the Agent Skills spec plus a few additional forge-specific rules: name length and character format, reserved-prefix collisions (`claude`, `anthropic`, `copilot`, `codex`, `gemini`), description length, no embedded newlines, no unescaped colons, no angle brackets, no first/second-person pronouns, no dated model IDs, a combined `description` + `when_to_use` cap of 1,536 characters, and an advisory (non-fatal) check for a negative trigger phrase.

With `--target`, it additionally prints a field-disposition report for that platform (which frontmatter fields survive the port, which are dropped, and which need a human decision). The report is generated from a table compiled into the script; it reads no files and resolves no ambiguous mapping on its own.

Reads only its command-line arguments, writes nothing to disk. Exits `0` with a success message on valid metadata, `1` with errors on stderr otherwise, `2` on an invalid `--target` or `--artifact` value.

## `ai-forge-audit/scripts/check-ecosystem.cjs`

Invoked as `node scripts/check-ecosystem.cjs [--roots <dir>[,<dir>...]] [--threshold 0.4] [--word-budget 1800] [--strict]`. Walks the given directories (default: the five platform skill roots plus `skills/`) looking for `<dir>/*/SKILL.md`, and **reads** each `SKILL.md` it finds plus the filenames — not contents — under each skill's `references/` directory.

It reports roster-level problems no single-artifact check can see: description keyword overlap between skills (Jaccard similarity above the threshold), duplicate or near-duplicate names, frontmatter names that don't match their directory, markdown links pointing at files that don't exist, reference files nothing links to, dated model IDs in frontmatter, and bodies over the word budget.

Read-only: it opens files but writes nothing to disk, and makes no network call. Prints a JSON report to stdout. Exits `0` normally, `10` when `--strict` is passed and errors were found, `1` on an unreadable file, `2` on invalid arguments.

## `ai-forge-eval/scripts/aggregate-benchmark.cjs`

Invoked as `node scripts/aggregate-benchmark.cjs --trials <trials.json> --artifact <path> [--prior <benchmark.json>] [--min-pass-rate 0.8] [--max-flaky-std 0.2] [--max-regression 0.1]`. Reads a trial-results JSON file and the artifact file being evaluated (only to compute a SHA-256 hash of its contents, via Node's built-in `crypto` module, so a later run can detect whether the artifact changed), and optionally a prior `benchmark.json` for regression comparison. Computes per-eval mean and standard deviation of pass rate, token count, and duration across trials, flags flaky evals (pass-rate std above threshold), classifies each assertion by whether it discriminates between the with-artifact and baseline arms, computes deltas against the prior run when the artifact hash matches, and applies a pass/fail gate. Prints the resulting `benchmark.json` payload to stdout; does not write any file itself, and does not make a network call. Exits `0` on success (with the payload on stdout) or `1` on a read or parse failure (with the error on stderr).

## Everything else

No other skill in this pack ships a script. Every skill's behavior beyond these three is prompt-driven: reading and writing the files a user points it at (SKILL.md, agent definitions, eval fixtures) through the host agent's own file tools, not through code these scripts run.
