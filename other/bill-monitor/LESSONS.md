# Lessons Learned — bill-monitor

| Lesson | Why it matters | Source |
|---|---|---|
| Keep credentials and target scope outside generated artifacts. | This skill interacts with services where leaked tokens, wrong accounts, or wrong targets create real risk. | SKILL.md external service rules |
| Extract deterministic helpers before calling AI for bill-monitor. | Parsing, validation, routing, and manifests are cheaper and safer as pure functions. | FUNCTIONS.md classification |
| Make handoffs explicit instead of relying on chat context. | Downstream skills and agents need paths, payloads, and auth assumptions recorded in files. | SKILL.md handoffs |

---

## Repo additions — 2026-05-18 triage (Pull-in attribution)

Source: `G:\AI\items_of_note\github-repos.md` → "TQuass full triage — 2026-05-15".

- **`mm7894215/TokenTracker` (362★)** — tracks Claude Code / Codex / Cursor / Gemini token usage; local-first dashboard + macOS menu bar + widgets. **Adopt:** complements `bill-monitor` — bill-monitor watches AWS Cost Explorer (cloud spend); TokenTracker watches local agent token consumption (the other half of true run cost). Wire TokenTracker's local export into the bill-monitor report so a single digest shows AWS COGS + agent token spend together. Local tool — no AWS perms needed.
