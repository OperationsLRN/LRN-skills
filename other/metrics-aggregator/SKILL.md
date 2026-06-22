# SKILL: metrics-aggregator

**Bot:** qa-auditor · deployer · operator · any
**Role:** Unified SLO + p95/p99 + error-budget view across Lambda (CloudWatch) + N8N + API + load-test results + Grafana/Prometheus. Pulls from 4+ data sources → emits a single dashboard.html + slo-report.md + metrics.json. Anomaly detection via z-score on rolling p99. Pairs with `load-testing` (point-in-time) for continuous observability.
**Ug-ug mode:** lite (collection), none (client-facing SLO report)
**Model:** phi4-mini (local) — anomaly classification; qwen2.5:7b (local) — narrative; sonnet — client-mode report
**Tool compatibility:** Claude Code · Cursor · Codex
**Status:** beta
**Parallelizable:** conditional — yes when targeting different engagement slugs (separate output dirs); no when same target (overwrites dashboard.html)

**Tags:** observability, slo, p95, p99, anomaly, cloudwatch, prometheus, grafana, error-budget, monitoring

## Permissions

| Type | Pattern | Why |
|---|---|---|
| Filesystem | `<engagement>/output/load-tests/**/results.json` | Read load-test results |
| Filesystem | `G:\AI\output\metrics\<slug>\<date>\*` | Write reports |
| Bash | `aws cloudwatch get-metric-statistics *`, `aws cloudwatch get-metric-data *` | Lambda + custom metrics |
| Network | `http://localhost:9090/api/v1/query*` (Prometheus) | If running |
| Network | `http://localhost:3000/api/datasources/*` (Grafana) | If running |
| Network | `https://api.posthog.com/*`, `https://*.umami.is/api/*`, GA4 BigQuery | Analytics |
| Network | N8N webhook execution-log endpoint (per engagement) | N8N workflow durations + errors |
| Network | `https://api.anthropic.com/*` | Sonnet for client narrative |
| Cache | local file | 1h TTL on metric collection |

---

## When to invoke

- "What's our SLO state right now?" / "Show me p99 across all services"
- Weekly/monthly observability review across active engagements
- Post-incident review (error-budget burn rate, p99 regression)
- Pre-release / post-release diff (did this deploy degrade anything?)
- "Is anything anomalous in the last 7 days?"
- Client-facing monthly SLO report (status page-style)

Do NOT invoke for: real-time alerting (Grafana / CloudWatch alarms do that better) or single-service deep-dive (use the service's own dashboard).

---

## Steps

### Step 1 — Discover data sources from engagement.json

```json
{
  "engagement_slug": "mythicquill",
  "data_sources": {
    "aws": {"profile": "taylor-at-mythicquill", "region": "us-east-1", "lambdas": ["fn-checkout", "fn-emailer"]},
    "prometheus": {"url": "http://localhost:9090", "jobs": ["api", "worker"]},
    "grafana": {"url": "http://localhost:3000"},
    "n8n": {"url": "https://n8n.example.com/api/v1", "workflow_ids": [12, 17]},
    "load_test_outputs": "G:\\AI\\output\\load-tests\\mythicquill\\*",
    "analytics": {"provider": "posthog", "project_id": "..."}
  },
  "slos": {
    "api_p95_ms": 500,
    "api_p99_ms": 1500,
    "api_error_rate_pct": 1.0,
    "lambda_cold_start_p95_ms": 800,
    "n8n_workflow_p95_s": 30
  }
}
```

### Step 2 — Pull metrics (parallel; one per source)

For each enabled source:

**AWS CloudWatch** (Lambda + custom):
```bash
aws cloudwatch get-metric-data --metric-data-queries file://queries.json \
  --start-time <window_start> --end-time <now> --region <region>
```

Captures per Lambda: Duration p50/p95/p99 · ConcurrentExecutions · Errors · Throttles · ColdStarts (init duration).

**Prometheus** (if running):
```
http://localhost:9090/api/v1/query_range?query=histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))
```

**N8N**: pull workflow execution logs via N8N API; compute duration histogram + error rate per workflow.

**Load-test outputs**: read latest `results.json` per project; extract p95/p99/RPS/error-rate per endpoint.

**Analytics** (PostHog / Umami / GA4): error event counts + active users.

### Step 3 — Compute rollups + anomalies

Per metric:
- Current value vs SLO threshold → PASS / NEAR_MISS (within 10%) / FAIL
- 7-day trend (sparkline)
- Rolling 7d z-score (μ ± 2σ → outlier flag)

Aggregate verdict per service + per engagement.

### Step 4 — Anomaly detection

For each time series:

```python
def detect_anomalies(series_7d):
    mean = statistics.mean(series_7d)
    stdev = statistics.stdev(series_7d)
    threshold = mean + 2 * stdev
    return [p for p in series_7d if p > threshold]
```

phi4-mini drafts a 1-sentence explanation per anomaly ("p99 on /api/checkout spiked at 2026-05-19 14:30 — coincides with deploy of v1.2.0").

### Step 5 — Build dashboard.html

Cytoscape-style status board:
- Per-service node colored by verdict (green / amber / red)
- Click-to-detail: shows SLOs + current values + sparkline + anomalies
- Top of page: overall engagement verdict + summary stats
- Pre-built template at `templates/dashboard.html` (interactive-diagram-style, no CDN dependency)

### Step 6 — Emit outputs

`G:\AI\output\metrics\<engagement-slug>\<YYYY-MM-DD>\`:

- `metrics.json` — full raw + derived
- `slo-report.md` — narrative; sonnet (client) or qwen2.5:7b (internal)
- `dashboard.html` — interactive status board
- `anomalies.md` — list of anomalies + 1-sentence explanations
- `error-budget.md` — current burn rate per service (if SLOs are configured)

### Step 7 — Notify

If any service FAIL → `notify.red_gate(failing_services)`. If anomalies detected → `notify.checkpoint(anomaly_summary)`.

---

## Input

```json
{
  "engagement_slug": "mythicquill",
  "window": "1h" | "24h" | "7d" | "30d",
  "client_mode": false,
  "include_anomaly_detection": true
}
```

## Output

- `output/metrics/<slug>/<date>/{metrics.json, slo-report.md, dashboard.html, anomalies.md, error-budget.md}`
- Exit code 0 = all CLEAR · 1 = NEAR_MISS or anomalies · 2 = FAIL

---

## Handoffs

- **In ← `engagement-config-setup`** — engagement.json with data_sources + slos
- **In ← `load-testing`** — load-test results.json
- **In ← `feature-traceability-mapper`** — AWS-side resource info to know what to query
- **Out → `notify`** — red gate / checkpoint
- **Out → `humanizer`** — final pass on slo-report.md (client mode)
- **Out → `deliverables-export`** — dashboard.html + report.md packaged for client
- **Out → `interactive-diagram`** — dashboard.html generation pattern (Cytoscape)

---

## Lambda candidates

- ✅ Step 2 metric pulls — each source is a separate Lambda; EventBridge hourly per engagement
- ✅ Step 3 rollup — pure math
- ✅ Step 4 anomaly detection — pure stats
- ❌ Step 5 dashboard.html — needs templating; can be Lambda + S3 output
- ❌ Step 6 narrative — AI step

Strong Lambda candidate as a whole — EventBridge hourly per active engagement is the canonical setup.

## Operating principles

1. Study existing patterns before modifying — `load-testing` (today) results.json is consumed here; pattern-match its schema
2. Keep changes small and reviewable — one data source at a time when extending
3. Match existing style/naming conventions — dashboard.html mirrors `interactive-diagram` Cytoscape pattern
4. Validate early; explain what can't be tested — if Prometheus is down, mark `data_source_unavailable`; don't fabricate metrics
5. Favour readability over cleverness — slo-report.md must lead with the verdict (CLEAR/NEAR_MISS/FAIL) in the first line
6. Declare what you conflict with: per-engagement output isolated; concurrent runs against same engagement overwrite the latest dashboard.html

## Pattern attribution

- **`prometheus/client_python` + `prometheus/prometheus`** (Apache-2.0) — Prometheus data source
- **`statsmodels/statsmodels`** (BSD-3) — z-score / anomaly stats
- **`pandas-dev/pandas`** (BSD-3) — time-series rollup helpers
- **`boto3/aws-cli`** (Apache-2.0) — CloudWatch reads
- **`grafana/k6-results-output`** — read `results.json` from today's load-testing skill

Concept-only references (no code import):
- DataDog / New Relic / Honeycomb dashboards — pattern study only; we build clean-room
