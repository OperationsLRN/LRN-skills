# SETUP: llm-bench

**Skill:** `llm-bench`
**Setup tier:** light
**Last verified:** 2026-06-03

## Dependencies

| Dep | Version | Install | Notes |
|---|---|---|---|
| Ollama | running | present | local model benchmarking |
| Python | 3.14 | present | bench script |

## Credentials / vault

None.

## .claude / harness wiring

None.

## Scheduled task / daemon

None.

## How to run

Invoke: `G:\AI\skills\wip\llm-bench\SKILL.md`
Trigger: "benchmark this model", "test model latency"

## Verify it works

1. Run `curl http://localhost:11434/api/tags` — Ollama must be running.
2. Run the skill against a target model.
3. Verify output includes: latency (ms), tokens/s, accuracy score.
