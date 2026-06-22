# FUNCTIONS: errant-resource-monitor

## Pure functions (Lambda candidates)

| Function | Inputs | Output | Notes |
|---|---|---|---|
| `list_known_stack_resources(profile, region)` | AWS creds | `{stack_id: [resource_id]}` | CF list-stacks + list-stack-resources; builds known-resource map |
| `scan_orphaned_eips(profile, region)` | AWS creds | `[{allocation_id, public_ip, age_days}]` | EC2 unassociated EIPs |
| `scan_orphaned_volumes(profile, region)` | AWS creds | `[{volume_id, size_gb, age_days}]` | EBS volumes in "available" state |
| `scan_old_snapshots(profile, region, max_age_days)` | AWS creds + max age | `[{snapshot_id, size_gb, age_days}]` | EBS snapshots > max_age not in AMI |
| `scan_orphaned_sgs(profile, region, known_resources)` | AWS creds + known map | `[{group_id, group_name}]` | Security groups not attached to any running instance |
| `scan_untagged_rds(profile, region, known_stacks)` | AWS creds + stack list | `[{db_id, status, age_days}]` | RDS instances with no CF stack tag |
| `scan_untagged_lambdas(profile, region, known_stacks)` | AWS creds + stack list | `[{function_name, last_modified}]` | Lambda functions with no CF stack tag |
| `estimate_monthly_cost(resource_type, resource_id, profile)` | resource info + creds | `{monthly_usd: float}` | Cost Explorer get-cost-and-usage; 24h lag |

## AI-assisted steps

| Step | Model | Why | Token estimate |
|---|---|---|---|
| Classify orphan risk per resource | phi4-mini | Route known/orphan/intentional-untagged | ~300 per resource |
| Narrate anomaly summary | sonnet | Human-readable digest for Telegram alert | ~800 |

## External services

| Service | Endpoint | Auth | Notes |
|---|---|---|---|
| CloudFormation | `cloudformation.<region>.amazonaws.com` | AWS profile | list-stacks, list-stack-resources |
| EC2 | `ec2.<region>.amazonaws.com` | AWS profile | describe-addresses, describe-volumes, describe-snapshots, describe-security-groups |
| RDS | `rds.<region>.amazonaws.com` | AWS profile | describe-db-instances |
| Lambda | `lambda.<region>.amazonaws.com` | AWS profile | list-functions |
| Cost Explorer | `ce.us-east-1.amazonaws.com` | AWS profile | get-cost-and-usage (24h lag; us-east-1 only) |
| Telegram | `api.telegram.org` | vault `Telegram/bot-token` + `Telegram/chat-id` | Checkpoint alert when orphans found |
