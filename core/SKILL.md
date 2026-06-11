# SKILL: consolidated-dev-kit

**Type:** kit
**Version:** 1.0.0
**Skills:** 28
**Tier:** starter (free)
**Status:** stable
**Audience:** New team members and contractors building admin panels, email automation, or AI tools on the QuassLabs / AppsTango stack.

## What this kit does

Installs 28 production-ready skills (24 core + 4 email/Ollama) and runs the guided `agent-setup-wizard` to configure Claude Code for a new developer in under 15 minutes. Replaces the previous 2-hour manual onboarding checklist.

## When to use this kit

- Onboarding a new team member or contractor who will use Claude Code
- Spinning up a new project and need the full foundation skill set in place before starting
- Rebuilding a project context after a machine migration or fresh clone
- Handing off a project to another developer who needs the same routing, memory, and config skills

## Skill index

| Skill | Role | What it does |
|---|---|---|
| `wip/lifecycle/agent-setup-wizard` | entry point | Guided wizard — generates CLAUDE.md + AGENTS.md + .cursorrules for a new project |
| `wip/lifecycle/project-env-setup` | utilities | Docker + env scaffolding: docker-compose.local.yml, .env template, memory-config.yaml |
| `wip/lifecycle/reflect` | utilities | End-of-session retrospective — writes lessons to LESSONS.md |
| `wip/lifecycle/session-handover` | utilities | Context-limit handover — writes HANDOVER.md + chat paste block |
| `wip/integrations` | connectors (10 sub-skills) | Integration wrappers: notion-crud, linear-crud, jira-crud, github-crud, slack-crud, fathom-sync, google-drive, google-chat, project-brain, recent-changes-alert |
| `wip/llm-selector` | routing | Selects the right LLM for a given task with cost estimate |
| `wip/gstack` | routing | Multi-role AI panel review (CEO / arch / QA / designer / security) |
| `wip/meta/skill-recommender` | routing | Given a task description, recommends matching hub skills or flags gaps |
| `wip/task-router` | routing | Pre-flight evaluator — assigns sub-tasks to the right model, flags red/yellow gates |
| `wip/ollama-task-router` | routing | Annotates a plan with LOCAL vs CLOUD routing decisions + token-cost savings estimate |
| `wip/memory/recommender` | memory | Entry point for all memory tasks — picks the right memory backend for the project |
| `wip/memory/advisor` | memory | Provisions and reports on the memory system for a project |
| `wip/memory/memory-ladder` | memory | 7-layer file-based memory backend (default for solo dev projects) |
| `wip/ug-ug` | config | Output-mode controller — 5-level compression ladder (lite to maximum-ug) |
| `wip/meta/skill-builder` | utilities | Draft, test, and iterate on new hub skills |
| `wip/meta/skill-linter` | utilities | Validate SKILL.md format — required headers, sections, ug-ug level |
| `wip/operator` | utilities | Routes requests to the right bot and skill; enforces skill registry |
| `wip/notify` | utilities | Telegram alerts — red_gate, checkpoint, report |
| `wip/meta/claude-md-sync` | utilities | Diffs skill folders on disk vs CLAUDE.md inventory; flags stale paths |
| `wip/local-runner` | utilities | Routes tasks to local machine (Ollama, Docker, n8n, ADB) instead of cloud |
| `wip/engagement-config-setup` | utilities | Scaffolds brand.json, engagement.json, environments.json for a new client |
| `wip/orchestrator` | utilities | Read selected modes and route to sub-agents; check resolve-or-generate cache |
| `wip/meta/skillmaster` | utilities | Hub lifecycle orchestrator — triage, prior-art check, file triad, promotion, sync |
| `wip/email-tool` | email | Gmail OAuth wrapper — fetch, read, draft, send, label; bots draft only, human approves |
| `wip/delphina/email-per-project` | email | 7-phase email triage: fetch → sort → classify → tests → draft reply → PM brief queue |
| `wip/delphina/email-pm-brief` | email | Daily PM brief from triage queue; PM approval → Jira submit + Gmail send |
| `wip/llm-orchestration-mcp` | ai | Exposes Ollama as MCP tools so Claude Code can delegate tasks to local models at $0 |

## Quick start

```
Invoke skill: G:\AI\skills\wip\lifecycle\agent-setup-wizard\SKILL.md
```

Or if distributing via the kit zip, run the install script first:

```bash
HUB_ROOT=/path/to/your/skills bash scripts/install-skills.sh
```

Then invoke `agent-setup-wizard` from any new project folder.

## Handoffs to other kits

| When you need... | Kit |
|---|---|
| Full QA gate pipeline (dev gate, release gate, security audit) | qa-automation-kit |
| Designer workflow (Figma, design tokens, handoff spec) | designer-toolkit |
| Admin panel + email integration (Lindsey pattern) | lindsey-admin-panel |
| Micah-style Jira worklog reporting | micah-agent-handover |
