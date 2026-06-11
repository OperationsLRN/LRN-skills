# SETUP: bill-monitor

**Skill:** `bill-monitor`
**Setup tier:** involved
**Last verified:** 2026-05-31

## Dependencies

| Dep | Install | Notes |
|---|---|---|
| AWS CLI | `winget install Amazon.AWSCLI` | Cost Explorer queries |
| boto3 | `pip install boto3` | Python SDK for Lambda handler |
| Terraform | `winget install Hashicorp.Terraform` | EventBridge + Lambda deploy |

## Credentials / vault
| Secret | Vault entry | How used |
|---|---|---|
| AWS profile | `AWS/<account>` | Must have `ce:GetCostAndUsage`, `cloudwatch:PutMetricAlarm`, `lambda:*`, `events:*` |

## Scheduled task / daemon
- EventBridge rule: `rate(1 day)` → Lambda handler
- Register via Terraform: `aws_cloudwatch_event_rule` + `aws_cloudwatch_event_target`
- Lambda function: `bill-monitor-handler` in target account

## How to run
```bash
# Ad-hoc spend query
aws ce get-cost-and-usage \
  --time-period Start=2026-05-01,End=2026-05-31 \
  --granularity MONTHLY \
  --metrics "UnblendedCost" \
  --profile <profile>

# Or invoke the skill for the full Lambda setup
Invoke skill: G:\AI\skills\wip\bill-monitor\SKILL.md
```

## Verify it works
1. `aws ce get-cost-and-usage` ad-hoc → returns spend JSON.
2. After Lambda deploy: trigger manually → Slack/notify message received with daily breakdown.
