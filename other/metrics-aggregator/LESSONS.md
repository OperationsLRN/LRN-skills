# LESSONS: metrics-aggregator

## Format

```
## YYYY-MM-DD — [short title]
**What happened:** ...
**Root cause:** ...
**Fix:** ...
**Applies to:** Step N
```

---

## 2026-05-20 — Skill created for unified observability

**What happened:** load-testing (today) produces point-in-time SLO results. Lambda + N8N + analytics + load-test data lived in 4 separate places. No unified observability view.

**Root cause:** Each data source had its own dashboard but nothing aggregated the picture.

**Fix:** Pull from 4+ data sources → rollup → verdict → unified dashboard.html + slo-report.md. Lambda-ready per source; EventBridge hourly per engagement.

**Applies to:** Steps 2-5.

## Repo additions — 2026-05-20 (Pull-in attribution)

- **`prometheus/client_python` + `prometheus/prometheus`** (Apache-2.0) — Prometheus data source. **Adopt** for local time-series queries.
- **`statsmodels/statsmodels`** (BSD-3) — anomaly detection. **Adopt** for z-score and rolling-window stats.
- **`pandas-dev/pandas`** (BSD-3) — time-series rollups. **Adopt.**
- **`boto3/aws-cli`** (Apache-2.0) — CloudWatch reads. Standard.
- **`grafana/k6-results-output`** — load-testing skill output schema (today). Reuse the format.

Concept-only references (no code import):
- DataDog / New Relic / Honeycomb / Lightstep dashboards — pattern study only; we build clean-room

## Tested scenarios (target before `beta → stable`)

- [ ] Mythicquill engagement → pull CloudWatch + load-test results + PostHog → emit dashboard.html
- [ ] Anomaly detection on a series with intentional outlier → z-score correctly flags it
- [ ] Cache hit on second run within 1h → no metric pulls; sub-second response
- [ ] SLO FAIL → notify.red_gate fires
- [ ] Data source unavailable (e.g., Prometheus down) → marked unavailable; other sources still resolve
- [ ] Client-mode report rendered with humanizer + brand styling
- [ ] Error-budget burn rate matches manual calculation on a test case

## Promotion gate

`beta → stable`: 3 weeks of EventBridge-hourly runs on a live engagement + at least one SLO regression caught by the alerting layer.
