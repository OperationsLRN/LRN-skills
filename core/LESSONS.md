# Lessons — consolidated-dev-kit

## 2026-06-09 — First kit-level review

- The 4 email/Ollama add-on skills (`email-tool`, `email-per-project`, `email-pm-brief`, `llm-orchestration-mcp`) were reconstructed from the kit description after the kit was originally shipped 2026-05-05 before the kits/ lifecycle stage existed. The manifest is marked `verified_against_zip: false` — if the original Drive zip is ever retrieved, reconcile the skill list against it before distributing a v1.1 build.

- `agent-setup-wizard` is the only entry point, but new recipients frequently try to invoke skills directly before running the wizard. The kit docs (README.md + START_HERE.md) already cover this, but SKILL.md should surface the wizard invocation at the top of Quick Start without burying it after the install-script step.

- The integrations bundle ships 10 sub-skills as a single folder entry in manifest.json. When `kit-builder` stages the zip, it must copy the entire `wip/integrations/` tree, not just the parent SKILL.md. Confirm this is handled in `install-skills.sh` before shipping to any recipient who needs individual connectors (Jira, Slack, etc.).
