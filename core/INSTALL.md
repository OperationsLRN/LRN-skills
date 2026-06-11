# INSTALL — consolidated-dev-kit

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
consolidated-dev-kit/
  INSTALL.md           ← this file
  README.md            ← overview and skill table
  START_HERE.md        ← first 5 minutes guide
  skills/
    integrations/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    llm-selector/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    gstack/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    skill-recommender/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    task-router/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    ollama-task-router/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    recommender/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    advisor/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    memory-ladder/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    ug-ug/
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
    operator/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    reflect/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    session-handover/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    claude-md-sync/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    notify/
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
    local-runner/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    engagement-config-setup/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    orchestrator/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    skillmaster/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    email-tool/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    email-per-project/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    email-pm-brief/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    llm-orchestration-mcp/
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
Skills installed: consolidated-dev-kit v1.0.0

Active skills:
  - integrations
  - llm-selector
  - gstack
  - skill-recommender
  - task-router
  - ollama-task-router
  - recommender
  - advisor
  - memory-ladder
  - ug-ug
  - skill-builder
  - skill-linter
  - operator
  - reflect
  - session-handover
  - claude-md-sync
  - notify
  - agent-setup-wizard
  - project-env-setup
  - local-runner
  - engagement-config-setup
  - orchestrator
  - skillmaster
  - email-tool
  - email-per-project
  - email-pm-brief
  - llm-orchestration-mcp

License: custom-commercial · single-user · non-redistributable
```

---

## 5. Verify it works

```bash
python tests/run_all.py
```

Expected: all tests PASS. If any fail, check prerequisites and vault keys.
