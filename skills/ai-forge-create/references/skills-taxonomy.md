# Skills Taxonomy

Reference for skills-specific drafting rules. Loaded in Phase 3 when artifact type is **Skill**.

---

## Directory structure

Place files in the correct spec directory — never at the skill root:

| Content type | Directory |
|---|---|
| Documentation loaded on demand | `references/` |
| Executable scripts (.js, .mjs, .cjs, .sh) | `scripts/` |
| Static data files, templates, JSON schemas | `assets/` |

Placing executable code or data files at the skill root is a spec violation. The skill root contains only `SKILL.md`.

---

## Progressive disclosure

- Body > 200 lines → move heavy content to `references/`
- Any section with a decision tree of 4+ branches → extract to `references/`
- Add MANDATORY READ triggers at the exact workflow step that needs it
- Add "Do NOT load" guidance for files irrelevant to the current scenario
- Context pointer wording controls reliability — "MANDATORY READ before every X call" fires more reliably than "read if needed"; fix the wording before pulling content back inline
- References max 1 level deep from `SKILL.md` — `SKILL.md → ref.md` is fine; `ref.md → deeper.md` causes partial reads where Claude misses content
- Reference files > 100 lines need a table of contents at the top — Claude may preview without reading fully

---

## Scripts

- **Solve don't punt** — scripts must handle error conditions and emit specific `stderr`; never surface "I don't know" to Claude
- **Forward slashes always** — `scripts/helper.cjs` not `scripts\helper.cjs`, even on Windows
- **Self-documenting constants** — no voodoo values; every constant must be obvious from context
- **stdout/stderr contract** — success to stdout, failure to stderr; Claude reads stderr to self-correct and retry

---

## Skill frontmatter (optional fields)

`license` (MIT, Apache-2.0), `compatibility` (environment/MCP requirements), `allowed-tools` (restricts which Claude tools the skill may invoke), and `metadata` (author, version, mcp-server) are valid spec fields. Include `compatibility` whenever the skill requires a specific MCP server or system package. Skill names must be kebab-case only — no spaces, no capitals, no `claude`/`anthropic` prefix.
