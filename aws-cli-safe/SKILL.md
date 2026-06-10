---
name: aws-cli-safe
description: >
  Use this skill before writing any AWS CLI commands, shell scripts that call `aws`, or
  any automation that interacts with AWS. Covers named-profile setup via ~/.aws/credentials
  and ~/.aws/config, the `aws configure` workflow, safe command patterns (dry-run, --query,
  explicit --profile and --region), and credential hygiene. Trigger whenever the task
  involves AWS CLI, aws configure, IAM access keys, or switching between AWS environments.
---

# SKILL: aws-cli-safe

**Bot:** deployer · developer · any  
**Role:** Safe AWS CLI command patterns — credentials files, named profiles, dry-run workflows, and guardrails that prevent accidental cross-environment actions.  
**Caveman mode:** full  
**Model:** haiku — deterministic command patterns; no generation needed  
**Tool compatibility:** Claude Code · Cowork · Codex · Cursor · AWS CLI

---

## When to invoke

- "Set up AWS credentials"
- "Configure AWS CLI for my account"
- "Write an AWS CLI command to..."
- "Switch between dev and prod AWS environments"
- Before writing any shell script that calls `aws ...`
- Before writing `.ps1` scripts that invoke `aws`

---

## Core principle: credentials files first

Always favor `~/.aws/credentials` and `~/.aws/config` over environment variables for local development. Reasons:

- Named profiles are easy to inspect, rotate, and switch without touching code
- Profiles survive terminal restarts; env vars don't
- Multiple accounts/roles live in one file — no juggling exports
- `aws configure list-profiles` gives you a quick audit trail

Reserve `AWS_*` environment variables for CI/CD pipelines and Lambda (where file-based credentials don't exist).

---

## Phase 1 — Set up credentials files

### File locations

| OS | credentials | config |
|---|---|---|
| macOS / Linux | `~/.aws/credentials` | `~/.aws/config` |
| Windows | `%USERPROFILE%\.aws\credentials` | `%USERPROFILE%\.aws\config` |

### credentials file format

```ini
[default]
aws_access_key_id = AKIAIOSFODNN7EXAMPLE
aws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

[dev]
aws_access_key_id = AKIAI44QH8DHBEXAMPLE
aws_secret_access_key = je7MtGbClwBF/2Wf/bPxRfiCY4fiBEXAMPLEKEY

[prod]
aws_access_key_id = AKIDPRODEXAMPLEKEY00
aws_secret_access_key = PRODEXAMPLESECRETKEY00000000000000000000
```

### config file format

```ini
[default]
region = us-east-1
output = json

[profile dev]
region = us-east-1
output = json

[profile prod]
region = us-east-1
output = table
```

Note: `[profile name]` prefix is required in `config` for non-default profiles. Not needed in `credentials`.

---

## Phase 2 — aws configure workflow

### Set up a new named profile interactively

```bash
aws configure --profile dev
# Prompts:
# AWS Access Key ID [None]: AKIAI44QH8DHBEXAMPLE
# AWS Secret Access Key [None]: je7MtGb...
# Default region name [None]: us-east-1
# Default output format [None]: json
```

### Set individual values without interactive prompts (good for scripting)

```bash
aws configure set aws_access_key_id AKIAI44QH8DHBEXAMPLE --profile dev
aws configure set aws_secret_access_key je7MtGb... --profile dev
aws configure set region us-east-1 --profile dev
aws configure set output json --profile dev
```

### Verify a profile

```bash
aws configure list --profile dev
aws sts get-caller-identity --profile dev
```

### List all configured profiles

```bash
aws configure list-profiles
```

---

## Phase 3 — Safe command patterns

### Always specify --profile and --region explicitly

Never rely on ambient defaults for any non-trivial command. Ambient defaults are the leading cause of accidental cross-environment actions.

```bash
# Good
aws s3 ls s3://my-bucket --profile dev --region us-east-1

# Risky -- runs against whatever profile is currently active
aws s3 ls s3://my-bucket
```

### Dry-run before destructive operations

```bash
# S3 sync/cp: always --dryrun first
aws s3 sync ./local s3://my-bucket --dryrun --profile dev --region us-east-1
# Review output, then remove --dryrun to execute

# EC2 operations: --dry-run flag
aws ec2 terminate-instances --instance-ids i-1234567890abcdef0 --dry-run --profile dev --region us-east-1
```

### Limit output with --query

Avoid dumping full JSON responses. Use `--query` to extract only what you need:

```bash
# List only function names, not full Lambda config
aws lambda list-functions \
  --query 'Functions[*].FunctionName' \
  --output text \
  --profile dev --region us-east-1

# Get a specific stack output value
aws cloudformation describe-stacks \
  --stack-name my-stack \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text \
  --profile dev --region us-east-1
```

### Output format guidance

| Use case | Format |
|---|---|
| Machine parsing / scripting | `--output json` |
| Human inspection | `--output table` |
| Simple string extraction | `--output text` |

---

## Phase 4 — Role assumption (when using IAM roles instead of keys)

```ini
# config file -- add a role-based profile
[profile staging]
role_arn = arn:aws:iam::123456789012:role/my-staging-role
source_profile = dev
region = us-east-1
```

Then use it like any other profile:

```bash
aws sts get-caller-identity --profile staging
```

AWS CLI will automatically call `sts:AssumeRole` using the `source_profile` credentials.

---

## Phase 5 — Environment variable patterns (CI/CD only)

Use env vars in CI pipelines and Lambda — not local dev.

```bash
# GitHub Actions / CI pattern
export AWS_ACCESS_KEY_ID=${{ secrets.AWS_ACCESS_KEY_ID }}
export AWS_SECRET_ACCESS_KEY=${{ secrets.AWS_SECRET_ACCESS_KEY }}
export AWS_DEFAULT_REGION=us-east-1

# Lambda: credentials injected automatically via execution role
# Never set AWS_* keys in Lambda env vars -- use the execution role
```

---

## Phase 6 — Credential hygiene checklist

```
[ ] No AWS keys hardcoded in any script, config file, or source code
[ ] ~/.aws/credentials is NOT committed to git (add to .gitignore)
[ ] ~/.aws/config is NOT committed to git
[ ] Each environment (dev/staging/prod) has its own named profile
[ ] aws sts get-caller-identity --profile <name> verified before running automation
[ ] --profile and --region specified on every CLI command in scripts
[ ] --dryrun or --dry-run used before any destructive S3/EC2 command
[ ] Rotate keys every 90 days (use IAM credential report to track)
```

---

## Common mistakes and fixes

| Mistake | Fix |
|---|---|
| `aws s3 rm --recursive` with no dry-run | Add `--dryrun` first; review before running |
| Ran command in prod instead of dev | Always `--profile dev` or `--profile prod` explicitly |
| Keys in `.env` file committed to git | `git rm --cached .env`, add to `.gitignore`, rotate the keys |
| `aws configure` with no profile name | Created a default profile; may clobber existing default |
| Lambda env vars contain access keys | Remove them; use the Lambda execution role instead |
| Script fails with `Unable to locate credentials` | `aws configure list --profile name` to check the profile exists |

---

## Lambda candidates

This skill is a generation-time checklist. No runtime Lambda component.

---

## Handoffs

| Next step | Skill |
|---|---|
| Generate IAM roles / trust policies for these credentials | `G:\AI\skills\wip\iam-advisor\SKILL.md` |
| Write PS1 scripts that call `aws` | `G:\AI\skills\wip\ps1-safe-script\SKILL.md` |
| Run Terraform with these credentials | `G:\AI\skills\wip\terraform-safe\SKILL.md` |
| Bootstrap a new AWS account | `G:\AI\skills\wip\aws-account-bootstrap\SKILL.md` |
