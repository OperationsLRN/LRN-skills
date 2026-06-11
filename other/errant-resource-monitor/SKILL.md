# SKILL: errant-resource-monitor

**Bot:** deployer · developer
**Role:** Scheduled AWS resource scanner — finds orphaned, untagged, or unexpected resources that are accruing cost without being tracked in any stack or Terraform state. Follow-up to iac-stack-teardown-safety and the WebMeet cleanup win.
**Ug-ug mode:** full
**Model:** phi4-mini — classification is deterministic (known-resource vs unknown); sonnet only for anomaly narration
**Tool compatibility:** Claude Code · Cursor · Codex
**Status:** beta
**Parallelizable:** yes — read-only across resource types; safe to fan out

**Tags:** aws, cloudformation, orphaned-resources, billing, monitor, scheduled, erik

## Permissions

| Type | Pattern | Why |
|---|---|---|
| Bash | `aws ec2 describe-*` | EIPs, security groups, volumes, snapshots |
| Bash | `aws rds describe-*` | RDS instances, snapshots |
| Bash | `aws s3api list-buckets` | Untagged S3 buckets |
| Bash | `aws cloudwatch get-metric-statistics *` | Idle EC2 detection |
| Bash | `aws ce get-cost-and-usage *` | Spend by resource tag |
| Bash | `aws lambda list-functions *` | Lambda functions with no stack tag |

## When to invoke

- After any stack delete (follow-up to iac-stack-teardown-safety)
- On a weekly schedule to catch drift between stack state and running resources
- Trigger: "check for orphaned resources", "unexpected AWS charges", "errant resource scan", "what's billing that shouldn't be?"
- Scheduled: Monday 9 AM via EventBridge (see SETUP.md)

## Steps

### Phase 1 — Tag inventory

1. Build a map of all known CloudFormation stacks + Terraform state resources:
   ```bash
   aws cloudformation list-stacks \
     --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE \
     --query 'StackSummaries[*].[StackName,StackId]' --output json \
     --profile <PROFILE>
   ```
2. Extract all resource IDs tagged to known stacks.

### Phase 2 — Orphan scan (6 resource types)

Run in parallel:

**EIPs (Elastic IPs):**
```bash
aws ec2 describe-addresses \
  --query 'Addresses[?AssociationId==null].[AllocationId,PublicIp,Tags]' \
  --output json --profile <PROFILE>
```

**Unattached EBS volumes:**
```bash
aws ec2 describe-volumes \
  --filters Name=status,Values=available \
  --query 'Volumes[*].[VolumeId,Size,CreateTime,Tags]' \
  --output json --profile <PROFILE>
```

**Old EBS snapshots (>30 days, not in any AMI):**
```bash
aws ec2 describe-snapshots --owner self \
  --query 'Snapshots[*].[SnapshotId,StartTime,VolumeSize,Tags]' \
  --output json --profile <PROFILE>
```

**Security groups not in any running instance:**
```bash
aws ec2 describe-security-groups \
  --query 'SecurityGroups[*].[GroupId,GroupName,Tags]' \
  --output json --profile <PROFILE>
# Cross-check against running instance SGs to find orphans
```

**RDS instances not tagged to any known stack:**
```bash
aws rds describe-db-instances \
  --query 'DBInstances[*].[DBInstanceIdentifier,DBInstanceStatus,TagList]' \
  --output json --profile <PROFILE>
```

**Lambda functions not tagged to any known stack:**
```bash
aws lambda list-functions \
  --query 'Functions[*].[FunctionName,LastModified,Tags]' \
  --output json --profile <PROFILE>
```

### Phase 3 — Classification

For each found resource:
- phi4-mini classifies: `known` | `orphan-likely` | `orphan-confirmed` | `intentional-untagged`
- Classification input: resource age + tags + cross-reference with known stack IDs
- `orphan-confirmed` = resource has no tag linking it to any active stack and is >7 days old

### Phase 4 — Report + alert

1. Emit `errant-resources-report.md` with:
   - Orphan count by type
   - Estimated monthly cost per orphan (from Cost Explorer)
   - Safe-to-delete vs needs-review classification
2. If `orphan-confirmed` resources found: send alert via `notify` (Telegram checkpoint)
3. Do NOT auto-delete — user must confirm each deletion

## Input spec

| Field | Type | Required | Notes |
|---|---|---|---|
| `profile` | string | yes | AWS CLI named profile |
| `region` | string | yes | AWS region to scan |
| `account_id` | string | no | For cross-account orphan detection |
| `dry_run` | bool | no | Default true — always report before any action |

## Output spec

```json
{
  "scan_timestamp": "ISO8601",
  "profile": "<profile>",
  "region": "<region>",
  "orphans": [
    {
      "type": "eip|ebs-volume|ebs-snapshot|security-group|rds-instance|lambda",
      "id": "<resource-id>",
      "age_days": 14,
      "monthly_cost_usd": 3.60,
      "classification": "orphan-confirmed",
      "safe_to_delete": true
    }
  ],
  "total_monthly_waste_usd": 47.20,
  "alert_sent": true
}
```

## Handoffs

- **iac-stack-teardown-safety** (`G:\AI\skills\wip\deployer\iac-stack-teardown-safety\SKILL.md`) — run before this if doing a full teardown
- **bill-monitor** (`G:\AI\skills\wip\bill-monitor\SKILL.md`) — for ongoing spend monitoring (threshold alerts)
- **aws-to-terraform** (`G:\AI\skills\wip\aws-to-terraform\SKILL.md`) — if orphans should be brought under Terraform management before deleting

## Lambda / Step Functions candidates

| Function | Why | Pattern |
|---|---|---|
| `scan_orphaned_eips(profile, region)` | Deterministic EC2 API | Lambda; daily EventBridge |
| `scan_orphaned_volumes(profile, region)` | Deterministic EC2 API | Lambda; daily EventBridge |
| `classify_orphan(resource, known_stacks)` | phi4-mini classification | Lambda; called per resource in Step Functions fan-out |
| `estimate_monthly_cost(resource_id, profile)` | Cost Explorer API | Lambda; async (CE has 24h lag) |
