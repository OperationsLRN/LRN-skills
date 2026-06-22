# LESSONS: context-mode

_(Seeded 2026-05-15. Append as the skill runs in production.)_

| Lesson | Why it matters | Source |
|---|---|---|
| **MCP `.mcp.json` placement determines scope** | Placing in project root applies context-mode only to that project; placing in `~/.claude/` applies globally to all Claude Code sessions. Prefer project-level to avoid filtering out useful output in unrelated sessions (e.g. debugging sessions that need full stdout). | mksglu/context-mode README |
| **`preserve_first_n` is critical for Python/TypeScript files** | Imports and type definitions at the top of files are often the most important part for cross-file reasoning. Without `preserve_first_n >= 10`, a filtered Python file may lose its entire import block, causing the model to miss dependency context entirely. | import from mksglu/context-mode issue #12 |
