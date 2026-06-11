# INSTALL — designer-toolkit

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
designer-toolkit/
  INSTALL.md           ← this file
  README.md            ← overview and skill table
  START_HERE.md        ← first 5 minutes guide
  skills/
    ug-ug/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    memory-ladder/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    agent-setup-wizard/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    project-env-setup/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    skillmaster/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    skill-builder/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    skill-linter/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    task-router/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    notify/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    session-handover/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    reflect/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    screen-builder/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    interactive-proto/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    figma-export/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    design-screen-generator/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    rapid-proto/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    frontend-polish-pass/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    mui-tailwind-coexistence-guide/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    mermaid-prerender/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    diagram-design-editorial/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    interactive-diagram/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    screen-builder/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    interactive-proto/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    figma-export/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    flow-diagram/
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
Skills installed: designer-toolkit v1.0.0

Active skills:
  - ug-ug
  - memory-ladder
  - agent-setup-wizard
  - project-env-setup
  - skillmaster
  - skill-builder
  - skill-linter
  - task-router
  - notify
  - session-handover
  - reflect
  - screen-builder
  - interactive-proto
  - figma-export
  - design-screen-generator
  - rapid-proto
  - frontend-polish-pass
  - mui-tailwind-coexistence-guide
  - mermaid-prerender
  - diagram-design-editorial
  - interactive-diagram
  - screen-builder
  - interactive-proto
  - figma-export
  - flow-diagram

License: custom-commercial · single-user · non-redistributable
```

---

## 5. Verify it works

```bash
python tests/run_all.py
```

Expected: all tests PASS. If any fail, check prerequisites and vault keys.
