#!/usr/bin/env node
/**
 * Validates skill/agent frontmatter metadata.
 * Usage: node scripts/validate-metadata.cjs --name "<name>" --description "<desc>"
 *
 * Checks (spec + our own forge rules):
 *   Name  : format, length, reserved prefixes
 *   Desc  : length, single-line, no colons, no angle brackets,
 *           no first/second-person, negative trigger present
 *
 * Exits 0 on pass, 1 on failure (errors to stderr). Zero dependencies.
 */

const args = process.argv.slice(2);

function arg(flag) {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
}

const name = arg("--name");
const description = arg("--description") ?? "";

if (!name) {
  process.stderr.write(
    'Usage: node validate-metadata.cjs --name "<name>" [--description "<desc>"]\n'
  );
  process.exit(1);
}

const errors = [];
const warnings = [];

// ── Name checks ───────────────────────────────────────────────────────────────

// Length
if (name.length < 1 || name.length > 64) {
  errors.push(`NAME ERROR: '${name}' is ${name.length} chars — must be 1–64.`);
}

// Format: lowercase, numbers, single hyphens, no leading/trailing/consecutive
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
  errors.push(
    `NAME ERROR: '${name}' is invalid — lowercase letters, numbers, and single hyphens only; ` +
    `cannot start/end with a hyphen or contain consecutive hyphens.`
  );
}

// Reserved prefixes (our forge rule + spec)
const RESERVED = ["claude", "anthropic", "copilot", "codex", "gemini"];
const usedReserved = RESERVED.find((p) => name.startsWith(p + "-") || name === p);
if (usedReserved) {
  errors.push(
    `NAME ERROR: '${name}' starts with reserved prefix '${usedReserved}' — choose a different name.`
  );
}

// ── Description checks ────────────────────────────────────────────────────────

// Length
if (description.length > 1024) {
  errors.push(
    `DESCRIPTION ERROR: ${description.length} chars — must be 1,024 or fewer.`
  );
}

// Single-line (no newlines — our forge rule: no YAML multiline)
if (/[\r\n]/.test(description)) {
  errors.push(
    `DESCRIPTION ERROR: multiline value detected — use a single-line string; never use YAML '|' or '>' block scalars.`
  );
}

// No unescaped colons (our forge rule — breaks frontmatter parsing)
if (description.includes(":")) {
  errors.push(
    `DESCRIPTION ERROR: unescaped colon in description — rephrase as '—' or '(…)'; ` +
    `colons break YAML frontmatter parsing when the value is unquoted.`
  );
}

// No XML angle brackets (our forge rule — prompt injection risk)
if (/<|>/.test(description) || /<|>/.test(name)) {
  errors.push(
    `FRONTMATTER ERROR: angle brackets ('<', '>') detected — remove them; ` +
    `frontmatter sits in the system prompt and angle brackets enable prompt injection.`
  );
}

// No first/second-person pronouns (spec + our rule)
const FORBIDDEN_PRONOUNS = ["i", "me", "my", "we", "our", "you", "your"];
const words = new Set(description.toLowerCase().match(/\b\w+\b/g) ?? []);
const found = FORBIDDEN_PRONOUNS.filter((w) => words.has(w));
if (found.length > 0) {
  errors.push(
    `STYLE ERROR: description contains first/second-person terms: ${found.join(", ")} — ` +
    `use third-person imperative (e.g. "Creates…", "Analyzes…").`
  );
}

// Negative trigger advisory (our forge rule — not a hard fail)
if (!/don't use for|do not use for|not for|avoid for/i.test(description)) {
  warnings.push(
    `STYLE ADVISORY: no negative trigger found — consider adding "Don't use for [anti-scenario]" ` +
    `to prevent mis-activation on adjacent tasks.`
  );
}

// ── Output ────────────────────────────────────────────────────────────────────

if (warnings.length > 0) {
  process.stdout.write(warnings.join("\n") + "\n");
}

if (errors.length > 0) {
  process.stderr.write(errors.join("\n") + "\n");
  process.exit(1);
}

process.stdout.write("SUCCESS: metadata valid.\n");
process.exit(0);
