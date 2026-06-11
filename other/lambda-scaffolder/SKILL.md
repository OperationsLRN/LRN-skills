# SKILL: lambda-scaffolder

**Bot:** any
**Role:** Read a SKILL.md Lambda candidates table and generate handler stubs, Terraform resource blocks, and READMEs for every ✅ row
**Ug-ug mode:** full
**Model:** sonnet — stub body content is derived from step descriptions via semantic reasoning, not deterministic formatting
**Tool compatibility:** Claude Code · Codex
**Status:** beta  <!-- v2-backfill 2026-05-31: auto-inferred — verify before ready/ promotion -->
**Parallelizable:** yes — no shared mutable state detected (auto-inferred; verify)

## Model

**Verdict:** `qwen2.5-coder:7b` — stub body generation from step descriptions is structured code generation that a code-specialist model handles well locally.

| Tier | Pick | Notes |
|---|---|---|
| Cloud | sonnet | Semantic reasoning over step descriptions to produce handler stubs |
| Local (installed) | qwen2.5-coder:7b | Code-specialist; good Python stub generation |
| Local (ideal) | qwen2.5-coder:32b (not installed) | Better for complex step descriptions with edge cases |

---

## When to invoke

- "Scaffold Lambda handlers for [skill]"
- "Generate Terraform for [skill] Lambda candidates"
- "Build Lambda stubs from [skill]'s candidates table"
- After flagging Lambda candidates during a Tier 3 review pass
- Any time a SKILL.md has a populated `## Lambda / Step Functions candidates` table with ✅ rows

---

## Steps

### Step 1 — Read target SKILL.md
Load the file at `skill_md_path`. Locate the `## Lambda / Step Functions candidates` section. If the section is missing or has no table rows, exit early with: `{ "error": "no_candidates_table", "file": skill_md_path }`.

### Step 2 — Parse the candidates table
Extract each row. Columns expected (flexible order): function name, step description, stateless flag, Lambda rating (✅ / ❌ / ⚠️). Skip any row where the rating column is ❌. Collect all ✅ rows. Log ⚠️ rows as warnings but do not generate stubs for them.

### Step 3 — Generate handler stub (sonnet, per ✅ row)
For each ✅ row, invoke sonnet with `(function_name, step_description)` as context. Produce a Python Lambda handler stub following this template exactly:

```python
import json
import boto3

def lambda_handler(event, context):
    # {step_description}
    # TODO: implement {function_name}
    return {
        "statusCode": 200,
        "body": json.dumps({"status": "ok"})
    }
```

Sonnet may expand the placeholder comments into 3–8 lines of scaffold logic (input parsing, boto3 calls, error handling) while keeping all actual business logic as TODO stubs. Do not generate working code — stubs only.

### Step 4 — Generate Terraform resource block (per ✅ row)
Produce a minimal `aws_lambda_function` resource block:

```hcl
resource "aws_lambda_function" "{function_name}" {
  function_name = "{function_name}"
  handler       = "handler.lambda_handler"
  runtime       = "python3.12"
  role          = var.lambda_execution_role_arn
  filename      = "./{function_name}.zip"

  environment {
    variables = {
      # TODO: add required env vars
    }
  }
}
```

Use snake_case for the resource label. Do not hardcode ARNs.

### Step 5 — Write output files
For each ✅ function, create a subfolder at `{output_dir}/{skill_name}/{function_name}/` and write:

| File | Content |
|---|---|
| `handler.py` | Python handler stub from Step 3 |
| `main.tf` | Terraform resource block from Step 4 |
| `README.md` | One-paragraph description of what to implement, what env vars to add, and which skill step this backs |

### Step 6 — Return manifest
Return a JSON manifest:

```json
{
  "skill": "{skill_name}",
  "generated": [
    {
      "function": "{function_name}",
      "files": [
        "{output_dir}/{skill_name}/{function_name}/handler.py",
        "{output_dir}/{skill_name}/{function_name}/main.tf",
        "{output_dir}/{skill_name}/{function_name}/README.md"
      ]
    }
  ],
  "skipped_warnings": ["{function_name_with_warning}"],
  "skipped_ineligible": ["{function_name_with_x}"]
}
```

---

## Handoffs

- **→ deployer/lindsey-crm-aws** — deploy the generated Terraform after reviewing stubs
- **→ terraform-safe** — run `terraform plan` and validate before `apply`; never apply without a plan review
- **→ iam-advisor** — generate the least-privilege IAM role for `var.lambda_execution_role_arn`

---

## Lambda / Step Functions candidates

| Function | Step | Stateless | Lambda |
|---|---|---|---|
| `parse_candidates_table` | Extract ✅ rows from a SKILL.md markdown table | ✅ | ⚠️ |
| `write_stub_files` | Write handler.py + main.tf + README.md to output dir | ✅ | ⚠️ |

Note: this skill itself uses sonnet for stub body generation and is therefore **not** a pure Lambda candidate (⚠️ = depends on AI call in the hot path). The file-write steps are deterministic but trivial.

---

## Input / Output spec

**Input:**
```json
{
  "skill_md_path": "<project>/skills/my-lambda/SKILL.md",
  "output_dir": "<project>/output/lambda-stubs"
}
```

`skill_md_path` — required. Absolute path to the target SKILL.md.
`output_dir` — optional. Defaults to `<project>/output/lambda-stubs/`.

**Output:**
```json
{
  "skill": "my-lambda",
  "generated": [
    {
      "function": "fetch_summaries",
      "files": [
        "<project>/output/lambda-stubs/my-lambda/fetch_summaries/handler.py",
        "<project>/output/lambda-stubs/my-lambda/fetch_summaries/main.tf",
        "<project>/output/lambda-stubs/my-lambda/fetch_summaries/README.md"
      ]
    }
  ],
  "skipped_warnings": [],
  "skipped_ineligible": []
}
```

## Permissions

<!-- v2-backfill 2026-05-31: auto-inferred — verify before ready/ promotion -->

| Type | Pattern | Why |
|---|---|---|
| Filesystem | `G:\AI\*` | Referenced in skill body |
