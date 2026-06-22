# Lessons Learned — llm-bench

| Lesson | Why it matters | Source |
|---|---|---|
| Keep credentials and target scope outside generated artifacts. | This skill interacts with services where leaked tokens, wrong accounts, or wrong targets create real risk. | SKILL.md external service rules |
| Extract deterministic helpers before calling AI for llm-bench. | Parsing, validation, routing, and manifests are cheaper and safer as pure functions. | FUNCTIONS.md classification |
| Make handoffs explicit instead of relying on chat context. | Downstream skills and agents need paths, payloads, and auth assumptions recorded in files. | SKILL.md handoffs |

---

## Repo additions — 2026-05-16 triage

Source: `G:\AI\items_of_note\github-repos.md` → "Full triage — 2026-05-16".

- **`EleutherAI/lm-evaluation-harness` (12.6k★ MIT)** — de-facto standard few-shot LLM eval framework (used by HF Open LLM Leaderboard). **Adopt as the accuracy backend:** for capability benchmarks (MMLU-style, task accuracy), shell out to lm-eval-harness rather than hand-rolling test sets. llm-bench keeps owning latency/tokens/cost; eval-harness owns correctness scoring.
- **`pinchbench/skill` (1.2k★ MIT)** — benchmarks LLMs specifically as **coding agents** (OpenClaw-style). **Adopt:** for "which model for the coding loop" decisions (gstack routing, art-train target selection), use pinchbench's coding-agent task suite as the eval, not generic accuracy.
- Routing: generic accuracy → lm-eval-harness; coding-agent fitness → pinchbench; latency/cost → llm-bench native.
