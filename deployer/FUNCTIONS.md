# Functions — deployer

## Pure functions (Lambda candidates)

| Function | Signature | What it does | Lambda? |
|---|---|---|---|
| `route_to_subskill` | `route_to_subskill(request: str, subskills: list[str]) -> str` | Maps a trigger or task description to the correct child skill. | ✅ |
| `list_subskill_capabilities` | `list_subskill_capabilities(subskills: list[dict]) -> list[dict]` | Builds a compact capability index from child skill metadata. | ✅ |
| `validate_handoff_payload` | `validate_handoff_payload(payload: dict, required_fields: list[str]) -> tuple[bool, list[str]]` | Checks that namespace routing has the fields the chosen child skill needs. | ✅ |
| `build_namespace_result` | `build_namespace_result(subskill: str, result: dict) -> dict` | Wraps child output with namespace routing metadata. | ✅ |

## AI-assisted steps

| Step | Model | Why AI | Est. tokens |
|---|---|---|---|
| Classify request into child skill | haiku | Routing is a fixed-choice decision over documented sub-skills. | ~200 |
| Summarize child-skill result for handoff | haiku | Formats returned metadata into a compact namespace-level response. | ~250 |

## Agents and caveman

| Item | Value | Notes |
|---|---|---|
| Bot/agents | developer · any | Deployment runbook namespace — structured deployment workflows for Intelgic projects to AWS Amplify and web adapters. |
| Caveman mode | full | Declared by SKILL.md metadata. |
| Caveman recommendation | full | Use for extraction depth and handoff style. |

## External services

| Service | Endpoint | Auth |
|---|---|---|
| AWS | AWS APIs via CLI/SDK | AWS profile or IAM role |
| Anthropic / Claude | Anthropic API or Claude app runtime | API key or app session |

## Lambda-equivalent implementation

| Capability | Lambda equivalent | Status |
|---|---|---|
| Input validation | Lambda validates payload shape and required fields. | Ready |
| Deterministic transforms | Lambda runs parsing, grouping, routing, and formatting helpers. | Ready |
| Durable state | S3 or DynamoDB replaces local files when persistence is needed. | Refactor needed |
| AI judgment | Step Functions calls the selected model and passes structured results forward. | Refactor needed |

## Lessons learned

| Lesson | Why it matters |
|---|---|
| Extract deterministic helpers before calling AI for deployer. |
| Parsing, validation, routing, and manifests are cheaper and safer as pure functions. |
| Make handoffs explicit instead of relying on chat context. |
| Downstream skills and agents need paths, payloads, and auth assumptions recorded in files. |

## Lambda candidate assessment

deployer is partly Lambda-ready because its parsing, validation, routing, grouping, and formatting work can be implemented as stateless helpers. Any local file state should move to S3 and any repeated run state should move to DynamoDB. If the skill invokes AI, use Step Functions to pass deterministic inputs to the selected model and persist structured output. Local tools, desktop apps, or long-running commands should remain external runners invoked from the serverless workflow.
