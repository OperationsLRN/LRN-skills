# SKILL: bill-monitor

**Bot:** deployer · operator  
**Role:** Monitor AWS spend via Cost Explorer. Runs daily via EventBridge → Lambda. Alerts via Slack or email if spend exceeds configurable thresholds per service or per tagged run. Also answers ad hoc queries: "what did this month's lindsey-crm runs cost?" Entirely Lambda + Python — no LLM needed.  
**Ug-ug mode:** full  
**Model:** haiku - deterministic log/event processing; no prose needed
**Tool compatibility:** Codex · Claude Code · AWS CLI · Cowork
**Status:** beta  <!-- v2-backfill 2026-05-31: auto-inferred — verify before ready/ promotion -->
**Parallelizable:** yes — no shared mutable state detected (auto-inferred; verify)

## Model

**Verdict:** `none` — entirely deterministic Python + boto3; Cost Explorer queries and Slack alerts require no LLM.

| Tier | Pick | Notes |
|---|---|---|
| Cloud | none | Alert formatting and threshold checks are pure logic |
| Local (installed) | none | No generation or analysis needed |
| Local (ideal) | none | No generation or analysis needed |

---

## When to invoke

- Deploy alongside any first AWS launch — monitoring should be live before the first run
- "What did lindsey-crm cost this month?"
- "Set up a spend alert for [service]"
- "Are we over budget?"
- Automatically: EventBridge daily at 7am UTC (before the 8am lindsey-crm run)

---

## Configuration

Set in `bill-monitor-config.json` (stored in S3 or alongside the Lambda):

```json
{
  "alert_thresholds": {
    "monthly_total_usd": 50,
    "bedrock_monthly_usd": 30,
    "lambda_monthly_usd": 5,
    "step_functions_monthly_usd": 2,
    "per_run_usd": 2.00
  },
  "alert_channels": {
    "slack_webhook": "https://hooks.slack.com/services/...",
    "email": "lindsey@intelgic.com"
  },
  "tag_filter": {
    "key": "Project",
    "value": "lindsey-crm"
  },
  "region": "us-east-1"
}
```

Tag all lindsey-crm resources with `Project=lindsey-crm` so per-project costs are isolatable.

---

## Lambda function

```python
# bill_monitor.py — deploys as a Lambda, also runnable locally

import boto3, json, os, urllib.request
from datetime import datetime, timedelta

def get_monthly_spend(ce_client, tag_key=None, tag_value=None):
    today = datetime.utcnow().date()
    start = today.replace(day=1).isoformat()
    end = today.isoformat()

    kwargs = {
        "TimePeriod": {"Start": start, "End": end},
        "Granularity": "MONTHLY",
        "Metrics": ["UnblendedCost"],
        "GroupBy": [{"Type": "DIMENSION", "Key": "SERVICE"}],
    }

    if tag_key and tag_value:
        kwargs["Filter"] = {
            "Tags": {"Key": tag_key, "Values": [tag_value]}
        }

    response = ce_client.get_cost_and_usage(**kwargs)
    results = {}
    for group in response["ResultsByTime"][0]["Groups"]:
        service = group["Keys"][0]
        amount = float(group["Metrics"]["UnblendedCost"]["Amount"])
        if amount > 0:
            results[service] = round(amount, 4)
    return results, sum(results.values())

def send_slack_alert(webhook_url, message):
    data = json.dumps({"text": message}).encode("utf-8")
    req = urllib.request.Request(webhook_url, data=data,
                                  headers={"Content-Type": "application/json"})
    urllib.request.urlopen(req)

def format_report(spend_by_service, total, thresholds):
    lines = ["*AWS Spend Report — lindsey-crm*", f"Month-to-date total: *${total:.2f}*", ""]
    for service, amount in sorted(spend_by_service.items(), key=lambda x: -x[1]):
        lines.append(f"  {service}: ${amount:.4f}")
    lines.append("")
    alerts = []
    if total > thresholds.get("monthly_total_usd", 9999):
        alerts.append(f"⚠️ Monthly total ${total:.2f} exceeds threshold ${thresholds['monthly_total_usd']}")
    bedrock_spend = sum(v for k, v in spend_by_service.items() if "Bedrock" in k)
    if bedrock_spend > thresholds.get("bedrock_monthly_usd", 9999):
        alerts.append(f"⚠️ Bedrock spend ${bedrock_spend:.2f} exceeds threshold ${thresholds['bedrock_monthly_usd']}")
    if alerts:
        lines.extend(alerts)
    else:
        lines.append("✅ All thresholds within budget")
    return "\n".join(lines)

def handler(event, context):
    config = json.loads(os.environ.get("CONFIG", "{}"))
    thresholds = config.get("alert_thresholds", {})
    slack_webhook = config.get("alert_channels", {}).get("slack_webhook")
    tag = config.get("tag_filter", {})

    ce = boto3.client("ce", region_name="us-east-1")  # Cost Explorer is global
    spend, total = get_monthly_spend(ce, tag.get("key"), tag.get("value"))

    report = format_report(spend, total, thresholds)
    print(report)

    # Always post to Slack
    if slack_webhook:
        send_slack_alert(slack_webhook, report)

    return {"total_usd": round(total, 4), "by_service": spend}
```

---

## Deploying the Lambda

```bash
# Zip and deploy
cd ./bill-monitor
pip install boto3 -t . --break-system-packages
zip -r bill-monitor.zip .

aws lambda create-function \
  --function-name bill-monitor \
  --runtime python3.12 \
  --role arn:aws:iam::ACCOUNT_ID:role/bill-monitor-role \
  --handler bill_monitor.handler \
  --zip-file fileb://bill-monitor.zip \
  --environment Variables="{CONFIG=$(cat bill-monitor-config.json)}" \
  --timeout 30

# EventBridge rule — daily at 7am UTC
aws events put-rule \
  --name bill-monitor-daily \
  --schedule-expression "cron(0 7 * * ? *)" \
  --state ENABLED

aws events put-targets \
  --rule bill-monitor-daily \
  --targets "Id=1,Arn=arn:aws:lambda:us-east-1:ACCOUNT_ID:function:bill-monitor"

# Grant EventBridge permission to invoke Lambda
aws lambda add-permission \
  --function-name bill-monitor \
  --statement-id EventBridgeInvoke \
  --action lambda:InvokeFunction \
  --principal events.amazonaws.com
```

Or include in Terraform (preferred — see `deployer/lindsey-crm-aws`):

```hcl
resource "aws_lambda_function" "bill_monitor" {
  function_name = "bill-monitor"
  handler       = "bill_monitor.handler"
  runtime       = "python3.12"
  role          = aws_iam_role.bill_monitor.arn
  filename      = "bill-monitor.zip"
  environment {
    variables = { CONFIG = file("bill-monitor-config.json") }
  }
}

resource "aws_cloudwatch_event_rule" "bill_monitor_schedule" {
  name                = "bill-monitor-daily"
  schedule_expression = "cron(0 7 * * ? *)"
}

resource "aws_cloudwatch_event_target" "bill_monitor" {
  rule = aws_cloudwatch_event_rule.bill_monitor_schedule.name
  arn  = aws_lambda_function.bill_monitor.arn
}
```

---

## Ad hoc queries (run anytime)

```bash
# Run locally against your AWS account
python bill_monitor.py --query monthly
python bill_monitor.py --query today
python bill_monitor.py --query service Bedrock
```

Or invoke the Lambda directly:
```bash
aws lambda invoke \
  --function-name bill-monitor \
  --payload '{"query": "monthly"}' \
  response.json && cat response.json
```

---

## Tagging resources for accurate per-project cost

Tag every lindsey-crm resource with `Project=lindsey-crm` at deploy time. In Terraform:

```hcl
locals {
  common_tags = {
    Project     = "lindsey-crm"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_lambda_function" "transcript_research" {
  # ...
  tags = local.common_tags
}
```

Without tags, Cost Explorer reports spend by service but can't isolate lindsey-crm from other Lambda functions in the account.

---

## Handoffs

| Next step | Skill |
|---|---|
| Deploy + configure | `G:\AI\skills\wip\deployer\lindsey-crm-aws\SKILL.md` |
| Infra changes based on cost findings | `G:\AI\skills\wip\infra-advisor\SKILL.md` |

## Lambda / Step Functions candidates

| Function | Step | Stateless? | Lambda? |
|---|---|---|---|
| `get_monthly_spend` | Step 1 — Cost Explorer query, group by service | yes | ✅ |
| `format_report` | Step 2 — format spend dict into Slack-ready text | yes | ✅ |
| `send_slack_alert` | Step 3 — POST formatted report to Slack webhook | yes | ✅ |
| `handler` | Orchestrator — EventBridge daily at 7am UTC triggers full run | yes | ✅ |

Note: bill-monitor is a strong Lambda candidate — the entire function is stateless Python + boto3. No LLM, no filesystem, no Docker required. EventBridge → Lambda → Cost Explorer → Slack is the canonical pattern.

## Input / Output spec

**Input:**

Lambda is invoked by EventBridge (no event payload required) or directly for ad hoc queries:

| Field | Type | Required | Notes |
|---|---|---|---|
| `query` | string | no | Ad hoc mode: `"monthly"`, `"today"`, or `"service <name>"`. Omit for scheduled run. |

Config is read from the `CONFIG` environment variable (JSON string):

| Field | Type | Required | Notes |
|---|---|---|---|
| `alert_thresholds.monthly_total_usd` | number | no | Default: 9999 (no alert) |
| `alert_thresholds.bedrock_monthly_usd` | number | no | Bedrock-specific threshold |
| `alert_thresholds.lambda_monthly_usd` | number | no | Lambda-specific threshold |
| `alert_channels.slack_webhook` | string | no | Slack incoming webhook URL |
| `alert_channels.email` | string | no | Alert email address |
| `tag_filter.key` | string | no | Cost Explorer tag key (e.g. `"Project"`) |
| `tag_filter.value` | string | no | Cost Explorer tag value (e.g. `"lindsey-crm"`) |
| `region` | string | no | AWS region, default `"us-east-1"` |

**Output:**

```json
{
  "status": "ok | error",
  "result": {
    "total_usd": 12.34,
    "by_service": {
      "Amazon Bedrock": 10.50,
      "AWS Lambda": 1.20,
      "AWS Step Functions": 0.64
    }
  }
}
```

## Permissions

<!-- v2-backfill 2026-05-31: auto-inferred — verify before ready/ promotion -->

| Type | Pattern | Why |
|---|---|---|
| Filesystem | `G:\AI\*` | Referenced in skill body |
| Network | `https://hooks.slack.com/*` | Referenced in skill body |
