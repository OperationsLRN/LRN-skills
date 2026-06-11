# Paste blocks for consolidated-dev-kit

---

## Block A — First-session orientation (drop into a fresh chat)

```
I just installed the consolidated-dev-kit (28 skills). Read these in order:

1. ~/.claude/skills/ug-ug/SKILL.md — apply ug-ug mode immediately
2. ~/.claude/skills/skillmaster/SKILL.md — your skill orchestration loop
3. ~/.claude/skills/memory-ladder/SKILL.md — 7-layer memory pipeline
4. ~/.claude/skills/agent-setup-wizard/SKILL.md — onboarding flow
5. ~/.claude/skills/task-router/SKILL.md — Step 0 pre-flight before any task

Then apply ug-ug mode to all internal reasoning:
- Ultra compression for plans
- Full compression for analysis  
- Normal prose only when talking to me directly

After reading, give me a 3-bullet summary of:
1. What you can now do that you couldn't before
2. Any skills with unclear scope or overlap
3. The first task you'd recommend I run agent-setup-wizard against
```

---

## Block B — Re-activate ug-ug after compaction

```
You drifted out of ug-ug mode. Re-apply: ultra for plans, full for analysis, normal prose only when talking to me. Don't acknowledge — just resume.
```

---

## Block C — Project-level CLAUDE.md install

Add this to your project's `CLAUDE.md` so every new chat in this project starts with the right context:

```markdown
## Skills available

Core skill kit installed at ~/.claude/skills/ (28 skills). Key entry points:
- skillmaster — orchestrate skill execution
- agent-setup-wizard — bootstrap config
- task-router — Step 0 pre-flight
- memory-ladder — cross-session memory
- ug-ug — token-efficient reasoning (always active)

## Ug-ug mode (always active)

| Context | Style |
|---|---|
| Plans | Ultra compression. Bullets only. |
| Internal reasoning | Full compression. Telegraphic. |
| Code output | No change. Always clean. |
| User chat | Normal prose. Clear communication. |

Reference: ~/.claude/skills/ug-ug/SKILL.md
```

---

## Block D — Verify install

```
Run these to confirm the consolidated-dev-kit is properly installed:

1. ls ~/.claude/skills/ | wc -l   (should be 28+)
2. claude-md-sync                  (should report no drift)
3. skill-linter ~/.claude/skills/*/SKILL.md (should pass all)

Report any failures and the exact error.
```
