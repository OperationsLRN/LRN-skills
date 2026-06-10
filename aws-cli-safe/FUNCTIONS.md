# Functions — aws-cli-safe

## Pure functions (Lambda candidates)

| Function | Signature | What it does | Lambda? |
|---|---|---|---|
| `parse_inventory` | `parse_inventory(raw: dict) -> list[dict]` | Extracts cloud resources, regions, tags, and identifiers from CLI/API output. | ✅ |
| `classify_resource_risk` | `classify_resource_risk(resource: dict, rules: list[dict]) -> str` | Applies deterministic guardrail rules to classify risk level. | ✅ |
| `build_change_plan` | `build_change_plan(resources: list[dict], desired_state: dict) -> dict` | Creates an ordered infrastructure action plan without executing it. | ✅ |
| `validate_profile_region` | `validate_profile_region(profile: str, region: str, allowed: list[str]) -> tuple[bool, list[str]]` | Checks account and region selection before cloud calls. | ✅ |
| `format_guardrail_report` | `format_guardrail_report(findings: list[dict]) -> str` | Formats deterministic infra findings into a markdown table. | ✅ |

## AI-assisted steps

| Step | Model | Why AI | Est. tokens |
|---|---|---|---|
| Review infrastructure risk and rollout order | opus | Cloud changes need judgment about blast radius, permissions, and dependency order. | ~700 |
| Draft operator-facing recommendation | sonnet | Converts resource facts into concise next steps and escalation language. | ~500 |
| Classify ambiguous CLI output | haiku | Routes known error text into fixed environment or permission categories. | ~250 |

## Agents and caveman

| Item | Value | Notes |
|---|---|---|
| Bot/agents | deployer · developer · any | Safe AWS CLI command patterns — credentials files, named profiles, dry-run workflows, and guardrails that prevent accidental cross-environment actions. |
| Caveman mode | full | Declared by SKILL.md metadata. |
| Caveman recommendation | full | Use for extraction depth and handoff style. |

## External services

| Service | Endpoint | Auth |
|---|---|---|
| GitHub | https://api.github.com and gh CLI | GitHub token or gh auth |
| AWS | AWS APIs via CLI/SDK | AWS profile or IAM role |
| Anthropic / Claude | Anthropic API or Claude app runtime | API key or app session |

## Lambda-equivalent implementation

| Capability | Lambda equivalent | Status |
|---|---|---|
| Inventory normalization | Lambda reads AWS API output and normalizes resource records. | Ready |
| Risk checks | Lambda applies deterministic guardrails before any write operation. | Ready |
| Stateful orchestration | Step Functions sequences account, region, and deployment checks. | Ready |
| Local CLI parity | CLI commands become SDK calls or SSM tasks. | Refactor needed |

## Lessons learned

| Lesson | Why it matters |
|---|---|
| Keep credentials and target scope outside generated artifacts. |
| This skill interacts with services where leaked tokens, wrong accounts, or wrong targets create real risk. |
| Extract deterministic helpers before calling AI for aws-cli-safe. |
| Parsing, validation, routing, and manifests are cheaper and safer as pure functions. |
| Make handoffs explicit instead of relying on chat context. |
| Downstream skills and agents need paths, payloads, and auth assumptions recorded in files. |

## Lambda candidate assessment

aws-cli-safe can use Lambda for inventory parsing, guardrail checks, and plan generation, but any live cloud mutation needs strict account, region, and approval controls. Local CLI steps should become SDK calls, SSM tasks, or Step Functions states with CloudWatch logging. Terraform or deployment state should live in S3/DynamoDB-backed systems rather than local files. High-risk judgment may still need Opus or human approval before execution.
