# INSTALL — Dev Essentials

**You are an AI coding agent. Read this before touching anything.**

---

## 0. Ground rules

- These skills are structured Markdown guidance — not runnable scripts.
- Each `SKILL.md` describes how to do one job well, with steps and handoffs.
- Adapt every path/host to THIS user's setup. Never use the author's machine paths literally.
- Do not overwrite existing files. Propose a plan, get a yes, then act.

---

## 1. Where skills live

| Agent | Target location |
|---|---|
| Claude Code | `~/.claude/skills/` (global) or `<project>/.claude/skills/` (project-local, preferred) |
| Cursor / Codex | Reference `SKILL.md` files directly, or copy to project docs |

Prefer **project-local** install so skills are versioned with the repo.

---

## 2. What's in this kit

```
dev-essentials/
  INSTALL.md           ← this file
  README.md            ← overview and skill table
  START_HERE.md        ← first 5 minutes guide
  skills/
    code-reviewer/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    arch-review/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    arch-decision/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    staged-test-runner/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    careful-guard/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    ps1-safe-script/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    github-sop/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    release-tagger/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    repomix-pack/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    local-project-env/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
```

---

## 3. Setup steps

1. **Check prerequisites** — see README.md Requirements section

2. **Add API keys to vault** — `keepassxc-secrets` skill handles vault access.
   Keys needed: none required

3. **Install Python dependencies**
   ```bash
   pip install # none required
   ```
   _(skip if empty)_

4. **Pull required Ollama models**
   ```bash
# (no Ollama models required)
   ```
   _(skip if empty)_

5. **Copy skills to your agent** — project-local preferred:
   ```bash
   cp -r skills/* <project>/.claude/skills/
   ```

6. **Run smoke test**
   ```bash
   python tests/run_all.py --smoke
   ```

---

## 4. First session paste block

Copy this into your first Claude Code session:

```
Skills installed: dev-essentials v1.0.0

Active skills:
  - code-reviewer
  - arch-review
  - arch-decision
  - staged-test-runner
  - careful-guard
  - ps1-safe-script
  - github-sop
  - release-tagger
  - repomix-pack
  - local-project-env

License: custom-commercial · single-user · non-redistributable
```

---

## 5. Verify it works

```bash
python tests/run_all.py
```

Expected: all tests PASS. If any fail, check prerequisites and vault keys.
