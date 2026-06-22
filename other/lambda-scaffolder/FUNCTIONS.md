# Functions — lambda-scaffolder

## Pure functions (Lambda candidates)

| Function | Signature | What it does | Lambda? |
|---|---|---|---|
| `parse_task_scope` | `parse_task_scope(task: str, files: list[str]) -> dict` | Turns a scoped build request into file, test, and constraint metadata. | ✅ |
| `select_template_or_tool` | `select_template_or_tool(task_type: str, constraints: dict) -> str` | Chooses the deterministic template, CLI, or helper path for the task. | ✅ |
| `build_file_plan` | `build_file_plan(scope: dict, repo_state: dict) -> list[dict]` | Produces an ordered list of candidate file operations for review. | ✅ |
| `validate_generated_paths` | `validate_generated_paths(paths: list[str], root: str) -> tuple[bool, list[str]]` | Ensures generated paths stay inside the intended workspace. | ✅ |
| `summarize_diff_metadata` | `summarize_diff_metadata(changes: list[dict]) -> dict` | Counts touched files, modules, and test surfaces without interpreting code intent. | ✅ |

## AI-assisted steps

| Step | Model | Why AI | Est. tokens |
|---|---|---|---|
| Generate or refactor implementation plan | sonnet | Code changes require reasoning about existing patterns and contracts. | ~900 |
| Write code or test text | sonnet | Produces coherent code, test names, or template edits from structured inputs. | ~800 |
| Summarize diff intent | haiku | Condenses changed-file metadata into a fixed summary shape. | ~250 |

## Agents and ug-ug

| Item | Value | Notes |
|---|---|---|
| Bot/agents | any | Read a SKILL.md Lambda candidates table and generate handler stubs, Terraform resource blocks, and READMEs for every ✅ row |
| Ug-ug mode | full | Declared by SKILL.md metadata. |
| Ug-ug recommendation | full | Use for extraction depth and handoff style. |

## External services

| Service | Endpoint | Auth |
|---|---|---|
| Fathom | Fathom API endpoint referenced by integration config | Fathom API key |
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
| Separate planning, execution, and verification outputs. |
| The skill is useful only when a later agent can see what changed and how it was checked. |
| Extract deterministic helpers before calling AI for lambda-scaffolder. |
| Parsing, validation, routing, and manifests are cheaper and safer as pure functions. |
| Make handoffs explicit instead of relying on chat context. |
| Downstream skills and agents need paths, payloads, and auth assumptions recorded in files. |

## Lambda candidate assessment

lambda-scaffolder is partly Lambda-ready because its parsing, validation, routing, grouping, and formatting work can be implemented as stateless helpers. Any local file state should move to S3 and any repeated run state should move to DynamoDB. If the skill invokes AI, use Step Functions to pass deterministic inputs to the selected model and persist structured output. Local tools, desktop apps, or long-running commands should remain external runners invoked from the serverless workflow.
