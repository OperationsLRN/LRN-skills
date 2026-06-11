# INSTALL — qa-automation-suite

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
qa-automation-suite/
  INSTALL.md           ← this file
  README.md            ← overview and skill table
  START_HERE.md        ← first 5 minutes guide
  skills/
    coverage-checker/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    defect-triage/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    dev-gate/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    release-gate/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    security-gate/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    story-test-builder/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    test-creator/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    test-strategist/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    attack-surface-scanner/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    staged-test-runner/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    exhaustive-test-generator/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    test-loop-orchestrator/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    test-loop-ug-ug-logger/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    test-loop-log-translator/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    code-reviewer/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    security-audit-router/
      SKILL.md
      FUNCTIONS.md
      LESSONS.md
    load-testing/
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
ollama pull phi4-mini
ollama pull qwen2.5-coder:7b
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
Skills installed: qa-automation-suite v1.0.0

Active skills:
  - coverage-checker
  - defect-triage
  - dev-gate
  - release-gate
  - security-gate
  - story-test-builder
  - test-creator
  - test-strategist
  - attack-surface-scanner
  - staged-test-runner
  - exhaustive-test-generator
  - test-loop-orchestrator
  - test-loop-ug-ug-logger
  - test-loop-log-translator
  - code-reviewer
  - security-audit-router
  - load-testing

License: custom-commercial · single-user · non-redistributable
```

---

## 5. Verify it works

```bash
python tests/run_all.py
```

Expected: all tests PASS. If any fail, check prerequisites and vault keys.
