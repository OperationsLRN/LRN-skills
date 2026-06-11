# SETUP: metrics-aggregator

**Skill:** `metrics-aggregator`
**Setup tier:** involved
**Last verified:** 2026-06-03

## Dependencies

| Dep | Version | Install | Notes |
|---|---|---|---|
| Python | 3.14 | present | runner |
| boto3 | any | `pip install boto3` | CloudWatch access |
| prometheus-client | any | `pip install prometheus-client` | Prometheus scrape (optional) |
| pandas | any | `pip install pandas` | anomaly detection |

## Credentials / vault

| AWS/<profile> | `AWS/<profile>` (KeePass ai-hub.kdbx) | CloudWatch Cost Explorer + metrics |

## .claude / harness wiring

AWS CLI profile must be configured for CloudWatch access.

## Scheduled task / daemon

None.

## How to run

Invoke: `G:\AI\skills\wip\metrics-aggregator\SKILL.md`
Trigger: "aggregate metrics", "SLO dashboard", "error budget report"

## Verify it works

1. Run `aws sts get-caller-identity --profile <profile>` — must succeed.
2. Run the skill.
3. Verify: `dashboard.html` + `slo-report.md` + `error-budget.md` produced.
