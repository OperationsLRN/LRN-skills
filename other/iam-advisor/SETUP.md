# SETUP: iam-advisor

**Skill:** `iam-advisor`
**Setup tier:** light
**Last verified:** 2026-05-31

## Dependencies

| Dep | Install | Notes |
|---|---|---|
| AWS CLI | `winget install Amazon.AWSCLI` | For verifying generated IAM policies |
| Terraform | `winget install Hashicorp.Terraform` | For HCL output |

## Credentials / vault
| Secret | Vault entry | How used |
|---|---|---|
| AWS profile | `AWS/<profile>` | Optional: `aws iam simulate-principal-policy` to verify |

## How to run
```
Invoke skill: G:\AI\skills\wip\iam-advisor\SKILL.md
```
Provide: service type (Lambda/Step Functions/AgentCore/EventBridge) + required actions → generates least-privilege IAM role + Terraform HCL.

## Verify it works
1. Invoke with "Lambda function that reads S3 and writes DynamoDB" → returns IAM role JSON + trust policy + Terraform `aws_iam_role` block.
