# Functions — efficiency

## Shipped scripts

| Script | Purpose | Lambda-ready? |
|---|---|---|
| `scripts/compress_command.py` | Wraps shell commands; routes through rtk backend or PS pattern library; returns compressed output | Yes (pure Python, no state) |
| `scripts/compress_thread.py` | Reads a session .jsonl; rewrites assistant turns via phi4-mini; emits `.compressed.jsonl` + `.seed.md` | Yes (stateless per file) |
| `scripts/_lib_llm.py` | Shared LLM call helper — timeout config, model routing, Ollama/cloud dispatch | N/A (library) |

Note: scripts/ bundle is Phase 3 of the kit delivery pipeline. Files listed above are the canonical names; include paths will be finalized when kit-builder stages the zip.

## AI steps (skills that make LLM calls)

| Skill | Step | Model tier | ~tokens |
|---|---|---|---|
| `ug-ug` | Compress assistant output to configured level | local (phi4-mini) | ~150–400 per turn |
| `compress/session` | Rewrite assistant turns (Pass 2) | local (phi4-mini) | ~800–2,000 per session |
| `compress/build-session` | Pass 2 assistant turn compression (after Pass 1 tool-result dedup) | local (phi4-mini) | ~800–2,000 per session |
| `llm-selector` | Score candidate models against 7-dimension task profile | local (phi4-mini) | ~400 |
| `ollama-task-router` | Annotate task list with LOCAL vs CLOUD tags + savings estimate | local (phi4-mini) | ~300 |
| `trace-reflector` | (in-progress) Classify step determinism; decide cache vs re-run | local (phi4-mini) | ~200 |

## Pure / deterministic steps

| Skill | Function | Notes |
|---|---|---|
| `compress/command` | `compress_command.py` | No LLM. rtk backend (git/gh/aws/docker) + PS pattern rewrite. Fallback verbatim. |
| `compress/build-session` | Pass 1: `is_build_heavy()` + dedup + truncate | Pure Python. No LLM. Triggered automatically. |
| `trace-reflector` | SHA-256 fingerprint of step inputs | Pure Python. No LLM at fingerprint stage. |
| `llm-selector` | Tier assignment (S0–S4) via keyword rules | Rule-based pre-pass before LLM scoring. |

## External services / deps

| Dep | Purpose | Required? |
|---|---|---|
| Ollama (local) | phi4-mini inference for compress/session + compress/build-session Pass 2 | Required for session compression |
| phi4-mini | Compress assistant turns; classify task tier in llm-selector and ollama-task-router | Required for compress/session |
| qwen2.5-coder:7b | LOCAL route target for code generation tasks (ollama-task-router) | Optional; fallback to cloud if absent |
| Python 3.9+ | compress_command.py, compress_thread.py, _lib_llm.py | Required |
| rtk (Rust binary) | Backend for compress/command git/gh/aws/docker output stripping | Optional; PS pattern library is fallback |
| Node.js | Re-render _waterfall.mmd Mermaid diagram only | Optional |
