# Functions — iam-advisor

## Pure functions (Lambda candidates)

| Function | Signature | What it does | Lambda? |
|---|---|---|---|
| `verify_scope_fields` | `verify_scope_fields(scope: dict, required_fields: list[str]) -> tuple[bool, list[str]]` | Checks consent, target, date, and authorization fields before testing. | ✅ |
| `parse_scan_output` | `parse_scan_output(raw_output: str, scanner: str) -> list[dict]` | Converts scanner output into normalized finding records. | ✅ |
| `calculate_cvss_score` | `calculate_cvss_score(vector: str) -> float` | Computes a CVSS-style severity score from a vector string. | ✅ |
| `build_finding_table` | `build_finding_table(findings: list[dict]) -> str` | Formats findings, evidence, severity, and remediation status. | ✅ |
| `redact_sensitive_evidence` | `redact_sensitive_evidence(text: str, patterns: list[str]) -> str` | Removes tokens, secrets, and private identifiers from evidence text. | ✅ |

## AI-assisted steps

| Step | Model | Why AI | Est. tokens |
|---|---|---|---|
| Interpret security impact and exploitability | opus | High-stakes vulnerability judgment requires careful context beyond deterministic scan parsing. | ~900 |
| Write remediation narrative | opus | Recommendations must be accurate, prioritized, and safe for client delivery. | ~700 |
| Classify ambiguous findings | sonnet | Needs semantic comparison between evidence and known vulnerability patterns. | ~500 |

## Agents and ug-ug

| Item | Value | Notes |
|---|---|---|
| Bot/agents | deployer · operator | Given a list of skills, Lambda functions, or services in a project, generates the exact IAM roles, trust policies, and inline permission files needed — nothing more. Enforces least-privilege by default. Knows the standard patterns for Lambda, Step Functions, AgentCore, API Gateway, EventBridge, and cross-account access. Outputs Terraform HCL and/or raw JSON policy documents ready to apply. |
| Ug-ug mode | full | Declared by SKILL.md metadata. |
| Ug-ug recommendation | full | Use for extraction depth and handoff style. |

## External services

| Service | Endpoint | Auth |
|---|---|---|
| AWS | AWS APIs via CLI/SDK | AWS profile or IAM role |
| Ollama | http://localhost:11434 | none for local API |
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
| Keep credentials and target scope outside generated artifacts. |
| This skill interacts with services where leaked tokens, wrong accounts, or wrong targets create real risk. |
| Extract deterministic helpers before calling AI for iam-advisor. |
| Parsing, validation, routing, and manifests are cheaper and safer as pure functions. |
| Make handoffs explicit instead of relying on chat context. |
| Downstream skills and agents need paths, payloads, and auth assumptions recorded in files. |

## Lambda candidate assessment

iam-advisor should split deterministic evidence handling from high-stakes security judgment. Parsing scan output, validating scope, scoring findings, and redacting evidence are Lambda-friendly. Active scanning, exploit validation, or browser-heavy testing is better handled by controlled runners with explicit authorization. Opus-level review is appropriate for impact and remediation language because mistakes can create client or safety risk.
