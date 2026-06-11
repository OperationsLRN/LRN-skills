# consolidated-dev-kit — v1.0.0

**Audience:** New team members + contractors building admin panels, email automation, AI-powered tools
**Built:** 2026-05-05
**Skills included:** 28 (24 core + 4 email/Ollama)
**Billable scope:** Foundation kit — not billable. Onboarding/distribution kit.

---

## What this is

28 production-ready skills + setup guides + templates that turn a fresh dev environment into a fully-functional Claude Code / Codex / Cursor setup with:

- AWS + GCloud authentication wired up
- 7-layer memory (MindPalace) preserved across sessions
- Cloud + local LLM routing (Claude vs Ollama)
- Email automation (Gmail OAuth, project triage, PM brief)
- Skill scaffolding + linting tooling

Replaces ~2 hours of manual setup with a 15-minute guided wizard.

---

## Quick install (2 minutes)

```bash
unzip consolidated-dev-kit-v1.0.0.zip
cd consolidated-dev-kit
npm install
./scripts/install-skills.sh

# Launch guided setup
agent-setup-wizard
```

What the wizard does:
- Discovers which skills you need (based on your task)
- Configures model routing (cloud Claude vs local Ollama)
- Sets up 7-layer memory (MindPalace) for long sessions
- Generates your `CLAUDE.md` + ready-to-use config

---

## Skills at a glance

| Category | Count | Examples |
|---|---|---|
| **Integrations** | 10 | github-crud, jira-crud, slack-crud, google-drive, notion-crud, fathom-sync, etc. |
| **LLM Routing** | 5 | llm-selector, task-router, ollama-task-router, gstack, skill-recommender |
| **Memory** | 3 | memory-ladder (7-layer), memory-recommender, memory-advisor |
| **Config** | 1 | ug-ug (4 compression levels) |
| **Utilities** | 5 | skill-builder, skill-linter, operator, reflect, session-handover, claude-md-sync, notify, agent-setup-wizard, project-env-setup, local-runner, engagement-config-setup, orchestrator, skillmaster |
| **Email (special)** | 4 | email-tool (Gmail OAuth), delphina/email-per-project, delphina/email-pm-brief, llm-orchestration-mcp |

---

## Quick examples

```bash
agent-setup-wizard              # Guided setup (start here)
recommend-skill "email monitor" # Find skills by task
organize-emails                 # Organize Gmail by project
setup-ollama                    # Install local LLM
```

---

## Files to read first

- `QUICKSTART.md` — 2-minute setup
- `START_HERE.md` — what to read in what order
- `TOOLKIT-SUMMARY.txt` — All 28 skills listed
- `MERGED-SKILL-KIT.json` — Metadata + entry point
- `PASTE-BLOCK-FOR-CLAUDE.md` — what to paste into your AI session

---

## Support

- `PHASE-5-COMPLETION.md` — What's included + verification
- `AWS-GCLOUD-SETUP-CHECKLIST.md` — AWS/Google Cloud setup (if building on cloud)

---

## What you bill on

Nothing — this is foundation infrastructure. You bill on whatever client work you build with these skills, not on the skills themselves.

---

## Reconstruction note

This kit was built and shipped 2026-05-05 before the kits/ lifecycle stage existed. The 4 email/Ollama skills listed in the manifest are best-guess reconstruction based on the original kit description. If you need to rebuild this exact zip, verify the on-Drive copy matches before promoting any updated version.
