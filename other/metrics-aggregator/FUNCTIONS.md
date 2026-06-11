# FUNCTIONS: metrics-aggregator

## Pure functions (Lambda-ready)

| Function | Purpose | Lambda |
|---|---|---|
| `load_engagement_metrics(slug)` | Read engagement.json data_sources + slos | ✅ |
| `pull_cloudwatch(profile, region, lambdas, window)` | AWS CloudWatch metric data | ✅ |
| `pull_prometheus(url, jobs, window)` | Prometheus HTTP API | ✅ |
| `pull_n8n(url, workflow_ids, window)` | N8N execution logs | ✅ |
| `pull_load_test_results(glob)` | Read latest results.json per project | ✅ |
| `pull_analytics(provider, project_id, window)` | PostHog / Umami / GA4 | ✅ |
| `compute_rollups(raw_metrics)` | p50/p95/p99/error-rate per service | ✅ |
| `check_slos(rollups, slos)` | PASS / NEAR_MISS / FAIL per metric | ✅ |
| `detect_anomalies(series, sigma=2.0)` | z-score outliers | ✅ |
| `compute_error_budget_burn(slos, actuals, window)` | Budget % consumed | ✅ |
| `aggregate_verdict(per_service_results)` | Overall engagement verdict | ✅ |
| `write_dashboard_html(payload, template_path, output_path)` | Cytoscape-style render | ✅ |
| `write_metrics_json(payload, path)` | Full machine-readable rollup | ✅ |

## AI-assisted steps

| Step | Model | Reason | Tokens |
|---|---|---|---|
| Anomaly explanation (1 sentence per anomaly) | phi4-mini local | $0; templated correlation lookup | ~200 per anomaly |
| Internal SLO narrative | qwen2.5:7b local | $0 | ~800 |
| Client-mode SLO report | sonnet | Client-facing prose + SLO discussion | ~2500 |
| Humanizer pass (client mode) | sonnet | Voice-match | ~1500 |

## External services

| Service | Auth | Purpose |
|---|---|---|
| AWS CloudWatch | Per-engagement AWS profile | Lambda metrics + custom |
| Prometheus | None (local) | Time-series query |
| N8N API | Per-engagement N8N token | Workflow logs |
| PostHog API | Per-engagement key | Analytics |
| Umami API | Per-engagement key | Analytics |
| GA4 / BigQuery | Per-engagement credentials | Analytics |
| Anthropic API (sonnet) | Vault `Anthropic/api_key` | Client-mode narrative |
| Ollama localhost:11434 | None | Anomaly explanations + internal narrative |

## Cache

| Cache | Backend | TTL | Key |
|---|---|---|---|
| Raw metric pulls per source | local file + S3 | 1h | `{slug, source, window, window_end}` |
| Anomaly z-scores | in-memory per run | per process | series-id |
