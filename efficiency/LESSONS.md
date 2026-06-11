# Lessons — efficiency

## 2026-06-09 — Kit-level penta file creation

- ug-ug and compress/command are the two consistently highest-impact layers and require zero prerequisites (no Ollama, no phi4-mini). Ship these first in any onboarding flow; do not gate them behind the phi4-mini install check.

- compress/session requires phi4-mini to be running before invocation. Recipients who install the kit on a machine without Ollama will get a silent no-op on Pass 2. The SETUP.md prereq check step (`ollama pull phi4-mini`) must be completed before the session compression scripts are usable — make this explicit in onboarding.

- The -67% output token reduction for ug-ug was measured on Taylor's production sessions (QuassLabs 2026-05). This number holds for planning-heavy and reasoning-heavy sessions. Pure code-generation sessions (where Claude outputs mostly code blocks) will show lower gains — the reduction is on prose output, not code output. Do not overclaim for code-only workflows.

- compress/command's -98% reduction applies to the known-noisy command set (git log, gh pr list, aws describe-*, Get-Process, schtasks /Query, npm ls). For unknown commands it falls back to verbatim and reports 0% reduction. Total session-level impact is proportional to how shell-heavy the workflow is; infra-heavy sessions benefit most.

- llm-selector and ollama-task-router savings are variable: the 5–10x per-call and 40–60% local-routing numbers are typical for mixed workflows (classification + extraction + reasoning). Pure Opus workflows (financial analysis, architecture decisions) will show lower routing gains since those tasks genuinely need cloud.

- compress/build-session's -80%+ figure comes from synthetic benchmarks, not production measurement as of 2026-06-09. Flag this in the REPORT.md "not yet measured in prod" note. Update with real measurement when the first production run is logged in this file.

- trace-reflector is in-progress. Do not include it in the core activation flow or onboarding paste block until status reaches beta. It is listed in the kit for completeness and roadmap visibility.

- The layers stack independently but are not all additive in every session. ug-ug + compress/command + llm-selector is the recommended three-layer baseline for any user. Add compress/session only for users who regularly hand off sessions. Add ollama-task-router only for users with a working Ollama stack.

- _lib_llm.py timeout: default is 60s. For large prompts (12k+ chars) with cold-load of 32B models, this causes TimeoutError → empty response. Pass `timeout>=180` for large-prompt 32B calls. This is already documented in global memory (lib_llm_timeout_32b.md) but must also be noted in the shipped _lib_llm.py header comment so kit recipients hit it without needing the private memory context.
