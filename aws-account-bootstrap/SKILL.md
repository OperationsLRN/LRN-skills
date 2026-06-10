# SKILL: aws-account-bootstrap

**Bot:** deployer · operator  
**Role:** Day-zero AWS account setup for any agent or LLM-backed service. Provisions the baseline guardrails every account needs before deploying: budget caps, Cost Explorer tagging, IAM permission boundaries, CloudWatch log retention, API Gateway rate limits, WAF basics, structured logging format, and a storage selection guide (PostgreSQL vs DynamoDB vs S3 vs ElastiCache). Outputs a ready-to-apply `bootstrap.tf`. Run this before any other deployment skill.  
**Caveman mode:** full  
**Model:** sonnet - pipeline orchestration with light reasoning
**Tool compatibility:** Codex · Claude Code · AWS CLI · Terraform · Cowork

## Model

**Verdict:** `qwen2.5-coder:7b` — HCL and Python config generation is the core output, making a code-specialist local model the right fit.

| Tier | Pick | Notes |
|---|---|---|
| Cloud | sonnet | Pipeline orchestration with config gen reasoning |
| Local (installed) | qwen2.5-coder:7b | Strong HCL/Python output; fits entirely in VRAM |
| Local (ideal) | qwen2.5-coder:32b (not installed) | Larger context for full bootstrap.tf generation |

---

## When to invoke

- First thing in any new AWS account or sub-account
- "Set up my AWS account for agents"
- "How do I avoid a $400/month bill?"
- Before running `deployer/ballparker-aws` or any other deployer skill
- When a coworker is starting from scratch
- After aws-to-terraform snapshots an existing account with no guardrails

---

## Phase 1 — Billing guardrails (do this first, always)

### 1a. Activate Cost Explorer
```bash
aws ce put-billing-view  # Cost Explorer auto-activates on first API call
aws ce update-cost-allocation-tags-status \
  --cost-allocation-tags-with-status TagKey=Project,Status=Active \
  --region us-east-1
```

### 1b. Monthly budget + alert
```hcl
resource "aws_budgets_budget" "monthly_cap" {
  name         = "${var.project_slug}-monthly-budget"
  budget_type  = "COST"
  limit_amount = var.monthly_budget_usd   # set conservatively: start at $50
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80   # alert at 80% of budget
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = [var.alert_email]
  }
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type             = "PERCENTAGE"
    notification_type          = "FORECASTED"
    subscriber_email_addresses = [var.alert_email]
  }
}
```

**Recommended starting budgets by workload:**
| Workload | Monthly cap |
|---|---|
| Dev / experimentation | $25 |
| Single agent, light use | $50 |
| Production agent, daily runs | $150 |
| Multi-agent, heavy Bedrock | $300 |

---

## Phase 2 — Tagging policy (required for cost isolation)

Tag every resource with `Project`, `Environment`, and `ManagedBy`. Without this, Cost Explorer can't isolate per-project spend.

```hcl
locals {
  common_tags = {
    Project     = var.project_slug
    Environment = var.environment     # dev | staging | prod
    ManagedBy   = "terraform"
    Owner       = var.owner_email
  }
}
```

AWS Config rule to enforce tagging (optional but recommended for teams):
```hcl
resource "aws_config_config_rule" "required_tags" {
  name = "required-tags"
  source {
    owner             = "AWS"
    source_identifier = "REQUIRED_TAGS"
  }
  input_parameters = jsonencode({
    tag1Key = "Project"
    tag2Key = "Environment"
  })
}
```

---

## Phase 3 — IAM permission boundary

A permission boundary caps what any role in the account can do, even if someone accidentally grants `AdministratorAccess`. Apply to all non-admin roles.

```hcl
resource "aws_iam_policy" "permission_boundary" {
  name        = "${var.project_slug}-permission-boundary"
  description = "Maximum permissions any project role may have"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCoreServices"
        Effect = "Allow"
        Action = [
          "lambda:*", "states:*", "s3:*", "dynamodb:*",
          "bedrock:*", "bedrock-agent:*", "bedrock-agent-runtime:*",
          "logs:*", "cloudwatch:*", "events:*",
          "ssm:GetParameter", "ssm:GetParameters",
          "secretsmanager:GetSecretValue",
          "sqs:*", "sns:Publish",
          "xray:PutTraceSegments", "xray:PutTelemetryRecords",
          "iam:PassRole"
        ]
        Resource = "*"
      },
      {
        Sid    = "DenyDangerous"
        Effect = "Deny"
        Action = [
          "iam:CreateUser", "iam:DeleteUser",
          "iam:AttachUserPolicy", "iam:PutUserPolicy",
          "organizations:*", "account:*",
          "billing:*", "budgets:ModifyBudget",
          "ec2:*",        # EC2 off by default — add back if needed
          "rds:*"         # RDS off by default — add if PostgreSQL required
        ]
        Resource = "*"
      }
    ]
  })
}
```

---

## Phase 4 — CloudWatch log retention

By default, CloudWatch log groups never expire. This costs real money at scale. Set 14-day retention on everything.

```hcl
# Apply to all Lambda log groups
resource "aws_cloudwatch_log_group" "lambda_logs" {
  for_each          = toset(var.lambda_function_names)
  name              = "/aws/lambda/${each.value}"
  retention_in_days = 14
  tags              = local.common_tags
}

# Apply to Step Functions
resource "aws_cloudwatch_log_group" "sfn_logs" {
  name              = "/aws/states/${var.project_slug}-pipeline"
  retention_in_days = 14
  tags              = local.common_tags
}
```

**Retention guide:**
| Log type | Recommended retention |
|---|---|
| Lambda function logs | 14 days |
| Step Functions execution logs | 30 days |
| API Gateway access logs | 30 days |
| Application error logs | 90 days |
| Audit / compliance logs | 365 days |

---

## Phase 5 — API Gateway rate limiting

Every public API endpoint must have rate limits. Without them, a misconfigured client, a bug, or a bad actor can run up thousands of Bedrock calls in minutes.

```hcl
resource "aws_api_gateway_usage_plan" "default" {
  name = "${var.project_slug}-default"
  api_stages {
    api_id = aws_api_gateway_rest_api.api.id
    stage  = aws_api_gateway_stage.prod.stage_name
  }

  # Adjust per workload — these are conservative starting defaults
  throttle_settings {
    rate_limit  = 10    # requests per second
    burst_limit = 20    # short spike allowance
  }
  quota_settings {
    limit  = 1000       # requests per month per API key
    period = "MONTH"
  }
}
```

**Rate limit guide by workload:**
| Use case | rate_limit | burst_limit | monthly quota |
|---|---|---|---|
| Internal tool, 1 user | 5 | 10 | 500 |
| Small team, 5 users | 10 | 25 | 2000 |
| Client-facing API | 20 | 50 | 10000 |
| High-volume public API | 100 | 200 | unlimited |

### Lambda reserved concurrency (prevent runaway scaling)
```hcl
resource "aws_lambda_function" "my_fn" {
  # ... other config ...
  reserved_concurrent_executions = 10  # hard cap; -1 = unrestricted (dangerous)
}
```

### WAF (for public APIs)
```hcl
resource "aws_wafv2_web_acl" "api_waf" {
  name  = "${var.project_slug}-api-waf"
  scope = "REGIONAL"

  default_action { allow {} }

  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 1
    override_action { none {} }
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "CommonRuleSet"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${var.project_slug}-waf"
    sampled_requests_enabled   = true
  }
  tags = local.common_tags
}
```

WAF adds ~$5–8/month. Worth it for any client-facing API.

---

## Phase 6 — Structured logging format

All Lambda functions should emit structured JSON logs. CloudWatch Insights can then query them without parsing.

```python
# common/logger.py — drop this in every Lambda project

import json, logging, os, time

LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO").upper()
logging.basicConfig(level=getattr(logging, LOG_LEVEL, logging.INFO))

def log(level: str, event: str, **kwargs):
    """Emit a structured JSON log line."""
    record = {
        "timestamp": int(time.time() * 1000),
        "level":     level.upper(),
        "event":     event,
        "project":   os.environ.get("PROJECT_SLUG", "unknown"),
        "function":  os.environ.get("AWS_LAMBDA_FUNCTION_NAME", "local"),
        **kwargs
    }
    print(json.dumps(record))

# Usage in handler.py:
# from common.logger import log
# log("info",  "job_started",  job_id=job_id, client=client)
# log("error", "sfn_failed",   job_id=job_id, error=str(e))
# log("warn",  "cache_miss",   fingerprint=sha256)
```

CloudWatch Insights query to find errors:
```
fields @timestamp, event, job_id, error
| filter level = "ERROR"
| sort @timestamp desc
| limit 50
```

---

## Phase 7 — Storage selection guide

Choose the right storage layer before writing any Terraform. Wrong choices here cause the most expensive rewrites.

### Decision tree

```
Is the data relational (joins, foreign keys, complex queries)?
  YES → PostgreSQL (RDS Aurora Serverless v2 or self-managed)
  NO  → continue

Is access pattern key-value or single-table (lookup by ID)?
  YES → DynamoDB (PAY_PER_REQUEST for low volume; provisioned for >1M reads/day)
  NO  → continue

Is it large binary data (files, images, PDFs, exports, archives)?
  YES → S3
  NO  → continue

Is it session state or caching (sub-millisecond reads, TTL)?
  YES → ElastiCache (Redis)
  NO  → DynamoDB with TTL is probably fine
```

### Comparison table

| | PostgreSQL (RDS/Aurora) | DynamoDB | S3 | ElastiCache (Redis) |
|---|---|---|---|---|
| **Best for** | Complex queries, reporting, joins | Key-value, job logs, user records | Files, exports, archives, ML data | Sessions, caching, leaderboards |
| **Pricing model** | Per instance-hour + storage | Per read/write unit + storage | Per GB + per request | Per node-hour |
| **Cold start cost** | ~$25–50/mo min (Aurora Serverless ~$0 when paused) | $0 (PAY_PER_REQUEST) | $0 | ~$15/mo min |
| **Scales to zero** | Aurora Serverless v2 only | Yes | Yes | No |
| **Max item size** | Unlimited | 400KB per item | 5TB per object | 512MB per key |
| **When NOT to use** | Simple lookups, no joins needed | Complex queries, ad-hoc analytics | Low-latency reads (<10ms) | Persistent storage needed |

### For agent workloads specifically:

| Data | Use |
|---|---|
| Job records (status, metadata) | DynamoDB |
| Output files (PDF, MD, JSON, HTML) | S3 |
| Cache (fingerprint → result) | DynamoDB (small) or ElastiCache (high volume) |
| Billing reports | S3 (write once, read rarely) |
| User accounts, billing data, relational records | PostgreSQL (Aurora Serverless v2) |
| Session state within an agent run | AgentCore SESSION_SUMMARY (built-in) or DynamoDB |
| Logs | CloudWatch (short-term) + S3 (long-term archive) |

---

## Phase 8 — Output: bootstrap.tf

All of the above assembled into one file. Apply with:
```bash
terraform init
terraform plan -var-file=bootstrap.tfvars -out=bootstrap.tfplan
terraform apply bootstrap.tfplan
```

`bootstrap.tfvars`:
```hcl
project_slug        = "my-project"
environment         = "prod"
alert_email         = "you@yourcompany.com"
owner_email         = "you@yourcompany.com"
monthly_budget_usd  = "50"
lambda_function_names = ["my-fn-1", "my-fn-2"]
```

---

## Cost impact of this bootstrap

| Guardrail | Monthly cost | What it prevents |
|---|---|---|
| Budget alert | $0 | Runaway spend |
| Tagging policy | $0 | Cost blindness |
| Log retention (14d) | Saves $5–50 | Infinite log accumulation |
| Reserved concurrency | $0 | Lambda storm (thousands of concurrent invocations) |
| API Gateway usage plan | $0 | Accidental or malicious API abuse |
| WAF | $5–8 | Bot traffic, injection attacks |
| **Total bootstrap cost** | **~$5–8/mo** | **Prevents $200–400/mo surprise bills** |

---

## Lambda candidates

- Entirely Terraform + Python config — no LLM needed
- Pattern: run once per account setup, then never again (or on account changes)
- Could be a CodeBuild pipeline: push to repo → bootstrap.tf applies automatically

---

## Handoffs

| Next step | Skill |
|---|---|
| Generate IAM roles + trust policies | `G:\AI\skills\wip\iam-advisor\SKILL.md` |
| Set up agent skills + Operator config | `G:\AI\skills\wip\agent-setup-wizard\SKILL.md` |
| Deploy Ballparker or other app | `G:\AI\skills\wip\deployer\ballparker-aws\SKILL.md` |
| Monitor ongoing costs | `G:\AI\skills\wip\bill-monitor\SKILL.md` |
| Snapshot existing infra | `G:\AI\skills\wip\aws-to-terraform\SKILL.md` |

## Lambda / Step Functions candidates

| Function | Step | Stateless? | Lambda? |
|---|---|---|---|
| Phase 1 — billing guardrails | Activate Cost Explorer + create AWS Budgets budget via Terraform | yes | ✅ |
| Phase 2 — tagging policy | Apply `common_tags` locals and optional AWS Config rule via Terraform | yes | ✅ |
| Phase 3 — IAM permission boundary | Generate and attach `aws_iam_policy` permission boundary via Terraform | yes | ✅ |
| Phase 4 — CloudWatch log retention | Set 14-day retention on all Lambda + SFN log groups via Terraform | yes | ✅ |
| Phase 5 — API Gateway rate limits | Create usage plan + WAF rule via Terraform | yes | ✅ |
| Phase 6 — structured logging drop-in | Generate `common/logger.py` template and write to project | yes | ✅ |
| Phase 7 — storage selection | Decision-tree lookup: project type → recommended storage layer | yes | ✅ |
| `bootstrap.tf` apply | `terraform plan -out=bootstrap.tfplan && terraform apply` | yes | ❌ |

Note: Phases 1–7 produce Terraform HCL and config files — stateless generation steps that are Lambda-compatible if output is written to S3. The actual `terraform apply` (Phase 8) runs locally or in CodeBuild — not Lambda. Best pattern: CodeBuild pipeline triggered by a push to the bootstrap repo runs `terraform apply` automatically, making this a near-fully automated bootstrap.

## Input / Output spec

**Input:**

| Field | Type | Required | Notes |
|---|---|---|---|
| `project_slug` | string | yes | Short identifier used as resource name prefix, e.g. `"ballparker"` |
| `environment` | string | yes | `"dev"` \| `"staging"` \| `"prod"` |
| `alert_email` | string | yes | Email for budget alerts and WAF notifications |
| `owner_email` | string | yes | Resource ownership tag value |
| `monthly_budget_usd` | string | yes | Budget cap amount, e.g. `"50"` |
| `lambda_function_names` | array | no | List of Lambda function names to create log groups for |
| `enable_waf` | bool | no | Default `false` — set `true` for any public-facing API |

**Output:**

```json
{
  "status": "ok | error",
  "result": {
    "files_written": ["bootstrap.tf", "bootstrap.tfvars"],
    "phases_complete": [1, 2, 3, 4, 5, 6, 7],
    "terraform_plan_required": true,
    "apply_command": "terraform apply bootstrap.tfplan",
    "estimated_monthly_cost_usd": 7.00
  }
}
```
