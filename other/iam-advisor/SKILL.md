# SKILL: iam-advisor

**Bot:** deployer · operator  
**Role:** Given a list of skills, Lambda functions, or services in a project, generates the exact IAM roles, trust policies, and inline permission files needed — nothing more. Enforces least-privilege by default. Knows the standard patterns for Lambda, Step Functions, AgentCore, API Gateway, EventBridge, and cross-account access. Outputs Terraform HCL and/or raw JSON policy documents ready to apply.  
**Ug-ug mode:** full  
**Model:** haiku - deterministic build/deploy commands; no generation needed
**Tool compatibility:** Codex · Claude Code · AWS CLI · Terraform · Cowork
**Status:** beta  <!-- v2-backfill 2026-05-31: auto-inferred — verify before ready/ promotion -->
**Parallelizable:** yes — no shared mutable state detected (auto-inferred; verify)

## Model

**Verdict:** `qwen2.5-coder:7b` — IAM policy and Terraform HCL generation is structured code output where a coding-specialist local model generates least-privilege policies reliably at $0.

| Tier | Pick | Notes |
|---|---|---|
| Cloud | sonnet | Policy pattern selection + trust policy reasoning |
| Local (installed) | qwen2.5-coder:7b | Coding specialist; strong for HCL + JSON policy generation |
| Local (ideal) | qwen2.5-coder:32b (not installed) | Best local for complex cross-account IAM patterns |

---

## Phase 0 -- Credentials file setup (do this before any IAM work)

Before creating roles or policies, confirm local credentials are configured correctly.
Full workflow: `G:\AI\skills\wip\aws-cli-safe\SKILL.md`

```bash
# Set up a named profile (dev, staging, prod -- never work as [default] in production)
aws configure --profile dev

# Verify you are in the right account before touching IAM
aws sts get-caller-identity --profile dev
```

Credentials file (`~/.aws/credentials` on macOS/Linux, `%USERPROFILE%\.aws\credentials` on Windows):
```ini
[dev]
aws_access_key_id = AKIAI44QH8DHBEXAMPLE
aws_secret_access_key = je7MtGb...

[prod]
aws_access_key_id = AKIDPRODEXAMPLEKEY00
aws_secret_access_key = PRODEXAMPLESECRETKEY000000000000000000
```

Config file (`~/.aws/config`) -- note the `[profile name]` prefix for non-default entries:
```ini
[profile dev]
region = us-east-1
output = json

[profile prod]
region = us-east-1
output = json
```

Set values programmatically without interactive prompts:
```bash
aws configure set aws_access_key_id AKIAI44QH8DHBEXAMPLE --profile dev
aws configure set region us-east-1 --profile dev
```

Rules:
- Never hardcode credentials in Terraform, scripts, or .env files
- Credentials files must not be committed to git
- Each environment gets its own named profile

---

## When to invoke

- After `aws-account-bootstrap` and before `infra-advisor` or any deployer skill
- "What IAM roles do I need for this?"
- "Generate the trust policy for my Lambda"
- "I'm getting an Access Denied -- what permission is missing?"
- "Set up cross-account access for my boss"
- When a coworker asks "what permissions does X need?"

---

## Input spec

```json
{
  "services": ["lambda", "step_functions", "agentcore", "api_gateway", "eventbridge"],
  "actions": {
    "lambda": ["read_s3", "write_s3", "read_dynamodb", "write_dynamodb", "read_ssm", "invoke_bedrock", "emit_cloudwatch"],
    "step_functions": ["invoke_lambda", "start_execution"],
    "agentcore": ["read_s3", "invoke_bedrock", "read_secrets"]
  },
  "cross_account": {
    "enabled": false,
    "trusted_account_id": "",
    "trusted_role_name": ""
  },
  "project_slug": "my-project",
  "region": "us-east-1",
  "account_id": "123456789012"
}
```

---

## Phase 1 — Role catalog

Standard roles for agent workloads. Pick what applies.

### Role 1: Lambda execution role (most common)

```hcl
resource "aws_iam_role" "lambda_exec" {
  name                 = "${var.project_slug}-lambda-exec"
  max_session_duration = 3600
  permissions_boundary = aws_iam_policy.permission_boundary.arn  # from aws-account-bootstrap

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
  tags = local.common_tags
}

# Base: CloudWatch Logs (always needed)
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# X-Ray tracing (recommended)
resource "aws_iam_role_policy_attachment" "lambda_xray" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/AWSXRayDaemonWriteAccess"
}
```

### Role 2: Step Functions execution role

```hcl
resource "aws_iam_role" "sfn_exec" {
  name = "${var.project_slug}-sfn-exec"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "states.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
  tags = local.common_tags
}

resource "aws_iam_role_policy" "sfn_invoke_lambda" {
  name = "invoke-lambda"
  role = aws_iam_role.sfn_exec.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["lambda:InvokeFunction"]
      Resource = "arn:aws:lambda:${var.region}:${var.account_id}:function:${var.project_slug}-*"
    }]
  })
}

resource "aws_iam_role_policy" "sfn_logs" {
  name = "cloudwatch-logs"
  role = aws_iam_role.sfn_exec.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["logs:CreateLogDelivery","logs:GetLogDelivery","logs:UpdateLogDelivery",
                  "logs:DeleteLogDelivery","logs:ListLogDeliveries","logs:PutLogEvents",
                  "logs:PutResourcePolicy","logs:DescribeResourcePolicies","logs:DescribeLogGroups"]
      Resource = "*"
    }]
  })
}
```

### Role 3: AgentCore (Bedrock Agent) role

```hcl
resource "aws_iam_role" "agentcore_exec" {
  name = "${var.project_slug}-agentcore-exec"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "bedrock.amazonaws.com" }
      Action    = "sts:AssumeRole"
      Condition = {
        StringEquals = { "aws:SourceAccount" = var.account_id }
        ArnLike      = { "aws:SourceArn" = "arn:aws:bedrock:${var.region}:${var.account_id}:agent/*" }
      }
    }]
  })
  tags = local.common_tags
}

resource "aws_iam_role_policy" "agentcore_bedrock" {
  name = "bedrock-invoke"
  role = aws_iam_role.agentcore_exec.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["bedrock:InvokeModel","bedrock:InvokeModelWithResponseStream"]
      Resource = "arn:aws:bedrock:${var.region}::foundation-model/*"
    }]
  })
}
```

### Role 4: EventBridge → Lambda invoke

```hcl
resource "aws_iam_role" "eventbridge_exec" {
  name = "${var.project_slug}-eventbridge-exec"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "events.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "eventbridge_invoke" {
  name = "invoke-lambda"
  role = aws_iam_role.eventbridge_exec.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["lambda:InvokeFunction"]
      Resource = "arn:aws:lambda:${var.region}:${var.account_id}:function:${var.project_slug}-*"
    }]
  })
}
```

---

## Phase 2 — Inline permission modules

Mix and match these onto the Lambda execution role based on what the Lambda actually does.

```hcl
# ── S3: read outputs bucket ───────────────────────────────────────────────────
resource "aws_iam_role_policy" "lambda_s3_read" {
  name = "s3-read"
  role = aws_iam_role.lambda_exec.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["s3:GetObject","s3:ListBucket","s3:HeadObject"]
      Resource = ["arn:aws:s3:::${var.project_slug}-outputs-*",
                  "arn:aws:s3:::${var.project_slug}-outputs-*/*"]
    }]
  })
}

# ── S3: write outputs bucket ──────────────────────────────────────────────────
resource "aws_iam_role_policy" "lambda_s3_write" {
  name = "s3-write"
  role = aws_iam_role.lambda_exec.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["s3:PutObject","s3:DeleteObject"]
      Resource = "arn:aws:s3:::${var.project_slug}-outputs-*/*"
    }]
  })
}

# ── DynamoDB: read/write job table ────────────────────────────────────────────
resource "aws_iam_role_policy" "lambda_dynamodb" {
  name = "dynamodb-job-table"
  role = aws_iam_role.lambda_exec.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["dynamodb:GetItem","dynamodb:PutItem","dynamodb:UpdateItem",
                  "dynamodb:DeleteItem","dynamodb:Query","dynamodb:Scan"]
      Resource = "arn:aws:dynamodb:${var.region}:${var.account_id}:table/${var.project_slug}-*"
    }]
  })
}

# ── SSM: read project parameters ─────────────────────────────────────────────
resource "aws_iam_role_policy" "lambda_ssm" {
  name = "ssm-read"
  role = aws_iam_role.lambda_exec.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["ssm:GetParameter","ssm:GetParameters","ssm:GetParametersByPath"]
      Resource = "arn:aws:ssm:${var.region}:${var.account_id}:parameter/${var.project_slug}/*"
    }]
  })
}

# ── Secrets Manager: read API keys ────────────────────────────────────────────
resource "aws_iam_role_policy" "lambda_secrets" {
  name = "secrets-read"
  role = aws_iam_role.lambda_exec.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["secretsmanager:GetSecretValue"]
      Resource = "arn:aws:secretsmanager:${var.region}:${var.account_id}:secret:${var.project_slug}/*"
    }]
  })
}

# ── Step Functions: start execution (for submit Lambda) ───────────────────────
resource "aws_iam_role_policy" "lambda_start_sfn" {
  name = "sfn-start-execution"
  role = aws_iam_role.lambda_exec.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["states:StartExecution","states:DescribeExecution","states:ListExecutions"]
      Resource = "arn:aws:states:${var.region}:${var.account_id}:stateMachine:${var.project_slug}-*"
    }]
  })
}

# ── CloudWatch: emit custom metrics ──────────────────────────────────────────
resource "aws_iam_role_policy" "lambda_cloudwatch" {
  name = "cloudwatch-metrics"
  role = aws_iam_role.lambda_exec.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["cloudwatch:PutMetricData"]
      Resource = "*"   # CW PutMetricData requires * resource
    }]
  })
}

# ── Bedrock: invoke models ────────────────────────────────────────────────────
resource "aws_iam_role_policy" "lambda_bedrock" {
  name = "bedrock-invoke"
  role = aws_iam_role.lambda_exec.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["bedrock:InvokeModel","bedrock:InvokeModelWithResponseStream",
                  "bedrock-agent-runtime:InvokeAgent"]
      Resource = "*"
    }]
  })
}

# ── Cost Explorer: read spend (for billing report Lambda) ─────────────────────
resource "aws_iam_role_policy" "lambda_cost_explorer" {
  name = "cost-explorer-read"
  role = aws_iam_role.lambda_exec.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["ce:GetCostAndUsage","ce:GetCostForecast"]
      Resource = "*"   # CE is global, requires *
    }]
  })
}

# ── SQS: send + receive (for hybrid router) ───────────────────────────────────
resource "aws_iam_role_policy" "lambda_sqs" {
  name = "sqs-send-receive"
  role = aws_iam_role.lambda_exec.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["sqs:SendMessage","sqs:ReceiveMessage","sqs:DeleteMessage","sqs:GetQueueAttributes"]
      Resource = "arn:aws:sqs:${var.region}:${var.account_id}:${var.project_slug}-*"
    }]
  })
}
```

---

## Phase 3 — Cross-account access

Two patterns depending on who needs access.

### Pattern A: Programmatic (IAM role assumption — for technical users)

```hcl
# In Taylor's account (sub-account) — creates the role boss can assume
resource "aws_iam_role" "cross_account_boss" {
  name = "${var.project_slug}-boss-access"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { AWS = "arn:aws:iam::${var.parent_account_id}:root" }
      Action    = "sts:AssumeRole"
      Condition = {
        StringEquals = { "sts:ExternalId" = var.external_id }  # optional but recommended
      }
    }]
  })
}

resource "aws_iam_role_policy" "boss_access_policy" {
  name = "invoke-api"
  role = aws_iam_role.cross_account_boss.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["execute-api:Invoke"]
      Resource = "arn:aws:execute-api:${var.region}:${var.account_id}:${aws_api_gateway_rest_api.api.id}/*"
    }]
  })
}
```

Boss's account policy (give this to boss's AWS admin):
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": "sts:AssumeRole",
    "Resource": "arn:aws:iam::TAYLOR_ACCOUNT_ID:role/PROJECT-boss-access"
  }]
}
```

### Pattern B: API key (simpler — for non-technical users)

Boss gets: CloudFront URL + `x-api-key` header value from `terraform output boss_api_key`.
No IAM setup needed in boss's account. This is the recommended default for non-developers.

---

## Phase 4 — Access Denied diagnosis

When a Lambda gets `AccessDenied`, run this to find the missing permission:

```bash
# Check recent Access Denied events in CloudTrail
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=AssumeRole \
  --region us-east-1 \
  --start-time $(date -d '1 hour ago' -u +%Y-%m-%dT%H:%M:%SZ) \
  --query 'Events[?contains(CloudTrailEvent, `AccessDenied`)].{Time:EventTime,Event:CloudTrailEvent}' \
  --output table

# Simulate the permission (Policy Simulator)
aws iam simulate-principal-policy \
  --policy-source-arn arn:aws:iam::ACCOUNT:role/ROLE_NAME \
  --action-names s3:PutObject \
  --resource-arns arn:aws:s3:::bucket-name/key
```

Common causes:
| Error | Likely missing permission |
|---|---|
| Lambda can't write to S3 | `s3:PutObject` on the bucket |
| Lambda can't read SSM | `ssm:GetParameter` scoped to `/project/*` |
| Step Functions can't invoke Lambda | `lambda:InvokeFunction` on `function:project-*` |
| AgentCore can't call Bedrock | `bedrock:InvokeModel` on `*` |
| Lambda can't start Step Functions | `states:StartExecution` on the state machine ARN |
| Lambda can't read Secrets Manager | `secretsmanager:GetSecretValue` scoped to `project/*` |

---

## Phase 5 — Least-privilege checklist

Before applying any IAM Terraform, verify:

```
[ ] No wildcard (*) actions except where AWS requires it (ce:*, cloudwatch:PutMetricData)
[ ] Resource ARNs scoped to project prefix, not account-wide
[ ] Permission boundary attached to every non-admin role
[ ] No AdministratorAccess or PowerUserAccess on Lambda/Step Functions roles
[ ] Trust policy scoped to specific service principal (not *)
[ ] Cross-account trust includes ExternalId condition if sensitive
[ ] No hardcoded credentials in Lambda env vars — use Secrets Manager or SSM
[ ] Roles named with project_slug prefix for Cost Explorer tag support
```

---

## Lambda candidates

- Phase 1–3: pure Terraform generation — no LLM needed beyond template selection
- Useful pattern: API Gateway POST `{ services: [...], actions: {...} }` → Lambda generates iam.tf → returns Terraform file
- Can be part of `agent-setup-wizard` Phase 9 handoff

---

## Handoffs

| Next step | Skill |
|---|---|
| Account-level guardrails first | `G:\AI\skills\wip\aws-account-bootstrap\SKILL.md` |
| Infra resources that need these roles | `G:\AI\skills\wip\infra-advisor\SKILL.md` |
| Deploy with roles applied | `G:\AI\skills\wip\deployer\lindsey-crm-aws\SKILL.md` |
| Diagnose runtime permission errors | Run Phase 4 diagnosis commands above |

## Permissions

<!-- v2-backfill 2026-05-31: auto-inferred — verify before ready/ promotion -->

| Type | Pattern | Why |
|---|---|---|
| Bash | `aws *` | Referenced in skill body |
| Filesystem | `G:\AI\*` | Referenced in skill body |
