# Functions — consolidated-dev-kit

## Shipped scripts

| Script | Purpose | Lambda-ready? |
|---|---|---|
| `scripts/install-skills.sh` | Copies all 28 skill folders from the kit into `$HUB_ROOT/wip/` | N/A (bash) |

## AI steps (skills that make LLM calls)

| Skill | Step | Model tier | ~tokens |
|---|---|---|---|
| `ug-ug` | Compress output to configured ug-ug level | local (phi4-mini) | ~200 |
| `llm-selector` | Score candidate models against task requirements | local (phi4-mini) | ~400 |
| `ollama-task-router` | Annotate task list with LOCAL vs CLOUD tags | local (phi4-mini) | ~300 |
| `task-router` | Pre-flight: assign models, flag red/yellow gates | local (phi4-mini) | ~500 |
| `gstack` | Multi-role review panel | cloud (Sonnet) | ~1,500–4,000 |
| `meta/skill-recommender` | Semantic match of intent to existing skills | local (phi4-mini) | ~600 |
| `lifecycle/reflect` | Extract lessons from session transcript | local (phi4-mini) | ~800 |
| `lifecycle/session-handover` | Summarize session state to HANDOVER.md | cloud (Sonnet) | ~2,000 |
| `memory/recommender` | Recommend memory backend from project inputs | local (phi4-mini) | ~300 |
| `lifecycle/agent-setup-wizard` | Generate CLAUDE.md + AGENTS.md + .cursorrules | cloud (Sonnet) | ~3,000 |
| `lifecycle/project-env-setup` | Generate docker-compose.local.yml + .env template | cloud (Sonnet) | ~1,500 |
| `notify` | Classify and dispatch alert (red_gate / checkpoint / report) | local (phi4-mini) | ~150 |
| `delphina/email-pm-brief` | Draft PM brief from classified email triage queue | cloud (Sonnet) | ~2,500 |
| `delphina/email-per-project` | Classify and draft replies for per-project email triage | cloud (Sonnet) | ~2,000 |

## Pure/deterministic steps

| Skill | Function | Notes |
|---|---|---|
| `meta/skill-linter` | `lint_skill.py` | File-walk + header validation; no LLM; exit 0=pass |
| `meta/claude-md-sync` | Disk vs inventory diff | Pure Python file-walk; no LLM |
| `email-tool` | `fetch()`, `label()`, `draft()` | Gmail API calls; no LLM; bots draft only |
| `integrations/*` | CRUD wrappers | API calls; no LLM at wrapper layer |
| `llm-orchestration-mcp` | `ollama_generate`, `ollama_chat`, `ollama_classify` | Passes through to Ollama; model selection is caller's |

## External services / deps

| Dep | Purpose | Required? |
|---|---|---|
| Ollama (local) | Local LLM inference — ug-ug, routing, classification | Optional; needed for phi4-mini steps |
| phi4-mini | Routing, compression, lesson extraction | Optional; falls back to cloud on miss |
| Gmail OAuth | `email-tool`, `email-per-project`, `email-pm-brief` | Optional; only if email skills are used |
| Telegram Bot API | `notify` | Optional; only if alert notifications needed |
| Python 3.9+ | `install-skills.sh` helper scripts, `skill-linter` | Required |
| `gh` CLI | `meta/claude-md-sync` diff, kit install verification | Optional |
