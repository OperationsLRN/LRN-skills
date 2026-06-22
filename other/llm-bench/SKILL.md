# SKILL: llm-bench

**Bot:** skillmaster (G:\AI\skills)  
**Role:** Compare LLM models against a given skill or task. Given a skill file and a set of test inputs, run each model, capture outputs and token/latency metrics, and produce a ranked comparison report. Runs locally and on AWS AgentCore. Informs which model to specify in each SKILL.md.  
**Ug-ug mode:** full  
**Model:** sonnet - reasoning, drafting, or research synthesis required
**Tool compatibility:** Claude Code · Cursor · Codex · Cowork
**Status:** beta  <!-- v2-backfill 2026-05-31: auto-inferred — verify before ready/ promotion -->
**Parallelizable:** yes — no shared mutable state detected (auto-inferred; verify)

## Model

**Verdict:** `none` — pure metric collection via Anthropic SDK calls; the skill measures models, it does not use one.

| Tier | Pick | Notes |
|---|---|---|
| Cloud | none | Benchmarking harness — runs target models, not itself |
| Local (installed) | none | No LLM needed for orchestration or scoring |
| Local (ideal) | none | Pure metric collection; Lambda-ready per-run invocation |

---

## When to invoke

- "Which model is best for this skill?"
- "Compare haiku vs sonnet on the email classifier"
- "Benchmark this prompt across all three tiers"
- "Run LLM comparison for [skill name]"
- Called by `llm-bench-runner` as the per-run evaluation unit

---

## Input spec

```json
{
  "skill_path": "G:\\AI\\skills\\wip\\[skill]\\SKILL.md",
  "test_inputs": [
    { "id": "t1", "input": { ... }, "expected_label": "optional ground truth" }
  ],
  "models": ["claude-haiku-4-5", "claude-sonnet-4-6", "claude-opus-4-6"],
  "environment": "local | aws-agentcore",
  "runs_per_input": 3,
  "metrics": ["latency_ms", "input_tokens", "output_tokens", "cost_usd", "accuracy"]
}
```

Default models if omitted: all three claude tiers.  
Default `runs_per_input`: 3 (for variance sampling).

---

## Output spec

```json
{
  "skill": "email-per-project/classify",
  "run_date": "2026-04-23",
  "environment": "local",
  "results": [
    {
      "model": "claude-haiku-4-5",
      "avg_latency_ms": 420,
      "p95_latency_ms": 610,
      "avg_input_tokens": 312,
      "avg_output_tokens": 48,
      "est_cost_per_1k_calls_usd": 0.18,
      "accuracy": 0.91,
      "pass_rate": "21/23",
      "variance_notes": "occasional label confusion between CHANGE and BUG at confidence <0.75"
    }
  ],
  "recommendation": "claude-haiku-4-5",
  "recommendation_rationale": "91% accuracy at 5x lower cost; acceptable for classify step with confidence threshold filter.",
  "log_path": "G:\\AI\\skills\\wip\\llm-bench\\logs\\email-per-project_classify_2026-04-23.jsonl"
}
```

---

## Phase 1 — Load skill and extract prompt

Read the target `SKILL.md`. Extract:
- The LLM classification or generation prompt (look for code blocks labeled as "Classification prompt" or "LLM step")
- The expected input/output shape
- Any existing `recommended_llm` annotation

If no explicit prompt is extractable: prompt the user to paste the prompt string or point to a `.prompt.txt` file in the skill folder.

---

## Phase 2 — Build test harness

For each `(model, test_input, run_index)` combination:

```python
import anthropic, time, json

client = anthropic.Anthropic()

def run_single(model, system_prompt, user_message):
    start = time.time()
    response = client.messages.create(
        model=model,
        max_tokens=512,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}]
    )
    latency = int((time.time() - start) * 1000)
    return {
        "model": model,
        "latency_ms": latency,
        "input_tokens": response.usage.input_tokens,
        "output_tokens": response.usage.output_tokens,
        "content": response.content[0].text
    }
```

**On AWS AgentCore (environment: aws-agentcore):**
- Replace `anthropic.Anthropic()` with Bedrock client
- Model IDs: `anthropic.claude-haiku-4-5-20251001-v1:0`, etc.
- Use `boto3` + `bedrock-runtime` `converse` API

**Free-cloud backend (freellmapi) — compare non-Anthropic models at $0:**
Route comparison runs for the ~14 free-tier providers (Gemini, Groq, Cerebras,
SambaNova, Mistral, OpenRouter, GitHub Models, Cloudflare, Cohere, Z.ai, NVIDIA NIM)
through the local freellmapi proxy via `_lib_llm.call_free_cloud()`:

```python
from _lib_llm import call_free_cloud   # G:\AI\routines on sys.path
def run_single_free(model, system_prompt, user_message):
    import time
    start = time.time()
    content = call_free_cloud(user_message, model=model,
                              task_type="bench", system_prompt=system_prompt)
    return {"model": model, "latency_ms": int((time.time()-start)*1000),
            "content": content}   # token usage not exposed by all free providers
```

> **Privacy gate:** free providers may train on inputs. Bench prompts sent here MUST be
> synthetic / public / non-sensitive — never real client, worklog, or vault content.
> `call_free_cloud()` hard-refuses sensitive prompts and non-allowlisted task types.
> Setup + provider keys: `G:\AI\routines\FREELLMAPI-SETUP.md`. Returns "" if the proxy
> is down or the guard refuses → record as "unavailable", don't fail the whole run.

---

## Phase 3 — Score results

For each run result:

**Accuracy scoring (if `expected_label` provided):**
```
exact_match: output JSON label == expected_label → 1.0
partial:     label correct but confidence low     → 0.5
mismatch:    wrong label                          → 0.0
```

**Cost estimation:**
```
claude-haiku-4-5:   $0.80/M input, $4.00/M output (as of 2026)
claude-sonnet-4-6:  $3.00/M input, $15.00/M output
claude-opus-4-6:    $15.00/M input, $75.00/M output
```
Note: prices change — update from https://www.anthropic.com/pricing before any cost-critical run.

---

## Phase 4 — Aggregate + rank

Aggregate per model:
- Mean + p95 latency
- Mean token counts
- Estimated cost per 1,000 calls
- Accuracy (if ground truth provided)
- Pass rate (parseable valid JSON output / total runs)

Rank by: accuracy first, then cost, then latency.

---

## Phase 5 — Emit recommendation

Emit `recommendation` + `recommendation_rationale` using this decision tree:

```
IF accuracy delta between top-2 models < 5%:
  → prefer the cheaper model
IF accuracy delta > 5%:
  → prefer the more accurate model
IF latency is the constraint (real-time UX):
  → prefer haiku unless accuracy falls below 85%
IF task involves multi-step reasoning or tool use:
  → prefer sonnet or opus regardless of cost
```

---

## Phase 6 — Write log

Append raw run data to JSONL log:
```
G:\AI\skills\wip\llm-bench\logs\[skill-slug]_[date].jsonl
```

One JSON object per run. Used by `llm-bench-runner` for aggregation and cleanup.

---

## Lambda candidates

- **Per-run execution:** Lambda-ready (stateless, invoke → result)
- Pattern: `llm-bench-runner` → invokes N parallel Lambda executions (one per model × input combination) → aggregates results
- Payload: `{ model, system_prompt, user_message, test_id }`
- Return: `{ test_id, model, latency_ms, tokens, content }`
- Log to S3 instead of local JSONL for AWS runs

---

## Handoffs

| Next step | Skill |
|---|---|
| Orchestrate multi-model bench run | `G:\AI\skills\wip\llm-bench-runner\SKILL.md` |
| Apply result to skill | Update `recommended_llm` in target SKILL.md |
| LLM selection reference | `G:\AI\skills\wip\llm-selector\SKILL.md` |

## Permissions

<!-- v2-backfill 2026-05-31: auto-inferred — verify before ready/ promotion -->

| Type | Pattern | Why |
|---|---|---|
| Filesystem | `G:\AI\*` | Referenced in skill body |
| Network | `https://www.anthropic.com/*` | Referenced in skill body |
