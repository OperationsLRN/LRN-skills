# LRN-skills — Skill Registry

Claude Code skills for OperationsLRN projects. See `UPDATES.md` for how to stay current.

---

## CRM-specific skills (no license required)

| Skill | Path | Purpose |
|-------|------|---------|
| email-organizer | `email-organizer/SKILL.md` | Gmail fetch, parse, and ingest for CRM pipeline |
| google-workspace-skill | `google-workspace-skill/SKILL.md` | Google OAuth2 multi-account management |
| aws-cli-safe | `aws-cli-safe/SKILL.md` | Safe AWS CLI wrapping with profile enforcement |
| aws-account-bootstrap | `aws-account-bootstrap/SKILL.md` | IAM role + account setup |
| deployer | `deployer/SKILL.md` | Lambda zip+deploy + S3 frontend sync |

---

## Core Developer Kit — `core/` (MIT license)

28 skills covering routing, memory, session management, and workflow foundation.

| Capability area | Reference | Notes |
|-----------------|-----------|-------|
| Output compression | `core/SKILL.md` — ug-ug section | Canonical source. Also referenced in efficiency/. |
| Model routing | `core/SKILL.md` — llm-selector / task-router / ollama-task-router | Canonical source. Also referenced in efficiency/. |
| Memory | `core/SKILL.md` — memory-ladder / memory-advisor | |
| Session ops | `core/SKILL.md` — reflect / session-handover / notify | |
| Skill management | `core/SKILL.md` — skillmaster / skill-builder / skill-linter | |
| Orchestration | `core/SKILL.md` — operator / orchestrator / local-runner | |
| Project setup | `core/SKILL.md` — agent-setup-wizard / project-env-setup | |
| Email (Ollama) | `core/SKILL.md` — email-tool / email-pm-brief sections | |

**License:** `LICENSE-MIT.md`

---

## QA + Developer Skills — `qa/` (trial license)

28 skills across two sub-kits. Covered by `LICENSE-TRIAL.md`.

### qa/suite/ — QA Automation Suite (18 skills)

| Capability area | Reference |
|-----------------|-----------|
| Quality gates | `qa/suite/SKILL.md` — dev-gate / release-gate / security-gate |
| Test generation | `qa/suite/SKILL.md` — story-test-builder / test-creator / test-strategist |
| Test execution | `qa/suite/SKILL.md` — staged-test-runner / test-loop-orchestrator |
| Telemetry | `qa/suite/SKILL.md` — test-loop-ug-ug-logger / test-loop-log-translator |
| Security | `qa/suite/SKILL.md` — attack-surface-scanner / security-audit-router / load-testing |
| Triage | `qa/suite/SKILL.md` — coverage-checker / defect-triage / qa-auditor |

### qa/essentials/ — Dev Essentials (10 skills)

| Capability area | Reference |
|-----------------|-----------|
| Code review | `qa/essentials/SKILL.md` — code-reviewer (canonical — also in qa/suite, use this one) |
| Architecture | `qa/essentials/SKILL.md` — arch-review / arch-decision |
| Safety | `qa/essentials/SKILL.md` — careful-guard / ps1-safe-script |
| Git/release | `qa/essentials/SKILL.md` — github-sop / release-tagger |
| Context | `qa/essentials/SKILL.md` — repomix-pack / local-project-env |

---

## Designer Toolkit — `design/` (trial license)

26 skills for UI, Figma, and frontend work. Covered by `LICENSE-TRIAL.md`.

| Capability area | Reference |
|-----------------|-----------|
| Screen building | `design/SKILL.md` — screen-builder / rapid-proto / design-screen-generator |
| Prototyping | `design/SKILL.md` — interactive-proto / interactive-diagram |
| Figma | `design/SKILL.md` — figma-export |
| Frontend polish | `design/SKILL.md` — frontend-polish-pass / mui-tailwind-coexistence-guide |
| Diagrams | `design/SKILL.md` — mermaid-prerender / diagram-design-editorial |
| Prompting | `design/DESIGN-PROMPT-TEMPLATE.md` |

---

## Efficiency Kit — `efficiency/` (trial license)

7 skills for cost reduction and output compression. Covered by `LICENSE-TRIAL.md`.

Note: `ug-ug`, `llm-selector`, and `ollama-task-router` overlap with `core/`. Use `core/` as
the canonical source; `efficiency/SKILL.md` covers the compression-specific extensions.

| Capability area | Reference |
|-----------------|-----------|
| Compression | `efficiency/SKILL.md` — compress / ug-ug (use core/ as canonical) |
| Cost routing | `efficiency/SKILL.md` — llm-selector / ollama-task-router (use core/ as canonical) |
| Tracing | `efficiency/SKILL.md` — trace-reflector (unique to this kit) |

---

## Deduplication rules

When two kits cover the same capability, use this priority order:

| Capability | Canonical source |
|-----------|-----------------|
| ug-ug | `core/SKILL.md` |
| llm-selector | `core/SKILL.md` |
| ollama-task-router | `core/SKILL.md` |
| code-reviewer | `qa/essentials/SKILL.md` |
| memory-ladder | `core/SKILL.md` |
| reflect / session-handover | `core/SKILL.md` |
| notify | `core/SKILL.md` |
