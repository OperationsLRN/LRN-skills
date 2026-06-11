# SKILL: efficiency

**Type:** kit
**Version:** 0.2.0
**Skills:** 7
**Tier:** custom-commercial
**Status:** stable
**Audience:** Claude Code power users and teams concerned about API costs.

## What this kit does

Seven mechanical compression layers that cut Claude API costs 40–98% without any prompt changes. Each layer targets a different cost source and stacks independently. ug-ug tightens every output token. compress/command strips shell noise. compress/session compacts transcripts for seeding. llm-selector right-sizes the model per call. ollama-task-router diverts 40–60% of steps to $0 local inference.

The two agency-pro layers (compress/build-session, trace-reflector) address build-heavy sessions and cached-output re-execution — the surfaces that output-token compression cannot reach.

## When to use this kit

- API bill is noticeably high and you want the first 80% of reduction without changing any prompts
- About to onboard a team to Claude Code and want cost discipline built in from day one
- Running long build sessions (many file reads + bash calls) with repetitive tool output
- Routing classification, extraction, or short codegen to local Ollama instead of Sonnet

## Skill index

| Skill | Reduction | Tier | Status |
|---|---|---|---|
| `ug-ug` | -67% output tokens | free | stable |
| `compress/command` | -98% command output tokens | free | stable |
| `compress/session` | -40–66% session transcript size | free | beta |
| `compress/build-session` | -80%+ build-session overhead | agency-pro | beta |
| `llm-selector` | 5–10x cheaper per call | free | beta |
| `ollama-task-router` | 40–60% of steps at $0 local | free | beta |
| `trace-reflector` | cached outputs skip re-execution | agency-pro | in-progress |

## Layer descriptions

### ug-ug

Five-level graded output mode. At `full` (default): internal reasoning, plans, and agent prose are maximally compressed — bullets, symbols, no articles, no filler openers. Chat replies stay normal prose. Deliverables untouched. Result: 67% reduction in output tokens on planning-heavy sessions, measured across 50 real session outputs.

Sub-skills: `ug-ug-compress` (batch-rewrite memory docs), `ug-ug-commit` (terse Conventional Commits), `ug-ug-review` (one-line PR comments).

### compress/command

Three-backend command proxy. `rtk` (Rust, MIT) handles git/gh/aws/docker output. A PowerShell pattern library rewrites verbose cmdlets to `Select-Object | ConvertTo-Json -Compress`. Fallback runs commands verbatim when no backend matches. Result: 98% reduction in command output tokens for known-noisy commands. Context window stays free for reasoning.

### compress/session

Asymmetric compressor — rewrites assistant turns to ug-ug ultra via phi4-mini (local, $0), leaves user turns verbatim. Emits `.compressed.jsonl` + `.seed.md` paste block. Result: 40–66% reduction in session file size. Script: `compress_thread.py`.

### compress/build-session (agency-pro)

Two-pass compressor for build-heavy sessions where tool-result bloat dominates. Pass 1 (pure Python, $0): truncate tool results at 60 lines, dedup repeated reads of the same path, trim bash outputs (first 30 + last 10 lines). Pass 2: compress assistant turns via compress/session. Auto-dispatches via `is_build_heavy()` check. Result: 80%+ reduction in build-session overhead.

### llm-selector

Seven-dimension task classifier. Assigns complexity tier S0–S4. Maps to optimal model + fallback chain + cost estimate. Covers Anthropic, OpenAI, Bedrock, and self-hosted. Tiers: S0 = phi4-mini/Nova Micro, S1 = Haiku/Nova Lite, S2 = Sonnet, S3 = Sonnet→Opus, S4 = Opus. Result: most S0–S1 tasks running on Sonnet today move to a 5–10x cheaper model with no quality loss.

### ollama-task-router

Decision table matching step keywords to LOCAL (Ollama) or CLOUD routes. Annotates a plan with `[LOCAL: phi4-mini]` / `[CLOUD: sonnet]` per step. Estimates token savings vs all-cloud baseline. Routing table: classify/detect/yes-no → phi4-mini; code gen (7B) → qwen2.5-coder:7b; extract fields → phi4-mini; summarize ≤500 tokens → phi4-mini; draft/research → Sonnet; security judgment → Opus. Result: 40–60% of typical plan steps at $0.

### trace-reflector (agency-pro, in-progress)

Caches deterministic step outputs by input fingerprint (SHA-256). On re-run, skips re-execution for inputs whose output is already known. Designed for pipelines where the same file reads, linter runs, or extraction steps fire on every session. Status: design complete, implementation in-progress as of 2026-06-09.

## Quick start

Apply ug-ug first — it requires no setup and delivers the single largest reduction:

```
Invoke skill: skills/wip/ug-ug/SKILL.md
Set ug-ug level: full
```

Then wire compress/command:

```
Invoke skill: skills/wip/compress/command/SKILL.md
```

Confirm phi4-mini is available before enabling compress/session:

```bash
ollama pull phi4-mini
```

## Handoffs to other kits

| When you need... | Kit |
|---|---|
| Full QA gate pipeline (dev gate, release gate, security audit) | qa-automation-kit |
| Production setup (Docker, env, memory config) | consolidated-dev-kit |
| Designer workflow (Figma, tokens, handoff) | designer-toolkit |

## Permissions

| Type | Pattern | Why |
|---|---|---|
| Bash | `ollama *` | Local model inference for compress/session Pass 2 |
| Bash | `python compress_thread.py *` | Session compression script |
| Bash | `python compress_command.py *` | Command compression script |
| Filesystem | `scripts/*.py` | Shipped scripts (Phase 3 bundle) |
