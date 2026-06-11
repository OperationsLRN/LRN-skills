# SKILL: api-designer
**Bot:** Scope Master
**Role:** Design or reverse-engineer a client's API layer; produce an OpenAPI 3.0 spec as a scope deliverable
**Ug-ug mode:** full
**Model:** sonnet
**Tool compatibility:** Claude Code · Cursor · Codex
**Status:** beta
**Parallelizable:** yes - refine on next touch


## Permissions

| Type | Pattern | Why |
|---|---|---|
| Filesystem | (skill-specific - see Steps) | Per-skill read/write paths |
| Network | (skill-specific - see Steps) | Per-skill API calls |
| Bash | (skill-specific - see Steps) | Per-skill tools |

*Note: v2 backfill defaults 2026-05-20. Refine when skill is next edited.*


## When to invoke

- Client has an undocumented existing API that must be understood before building integrations
- Scope requires designing a greenfield REST or GraphQL API from feature requirements
- Client can run their app locally and capture HTTP traffic for reverse-engineering
- api-spec.yaml is needed as input to db-designer or scope-proposal-workbook

## Inputs

| Field | Type | Required |
|---|---|---|
| `mode` | `"reverse_engineer"` \| `"greenfield"` | yes |
| `intake_path` | path to `scope-intake-output.json` | for greenfield |
| `flow_dump_path` | path to mitmproxy flow YAML/dump | for reverse_engineer |
| `base_url` | string — client's API base URL | for reverse_engineer |
| `api_style` | `"rest"` \| `"graphql"` | optional (default: rest) |
| `output_dir` | path | optional (default: cwd) |

## Steps

### Mode A — Reverse-engineer existing API

1. **Verify prerequisites**
   - mitmproxy installed: `mitmproxy --version`
   - mitmproxy2swagger installed: `mitmproxy2swagger --version`
   - If missing: `pip install mitmproxy mitmproxy2swagger`

2. **Capture traffic** (manual step — instruct client/user)
   - Start mitmproxy proxy: `mitmproxy -p 8080 -w flow.dump`
   - Configure client app or browser to use proxy `localhost:8080`
   - Exercise all key API flows (auth, CRUD for each resource, edge cases)
   - Stop mitmproxy when done; save `flow.dump`

3. **Generate OpenAPI spec**
   - `mitmproxy2swagger -i flow.dump -o api.yaml -p <base_url> --examples`
   - Review generated `api.yaml` — fill in `FIXME` placeholders (operation IDs, descriptions, auth scheme)

4. **Clean and annotate**
   - `clean_openapi_spec(api_yaml)` — remove duplicate paths, fix missing response schemas
   - Add authentication scheme (Bearer / API key / OAuth2) based on captured headers
   - Group endpoints into logical tags (resource-based)

5. **Generate summary**
   - `build_api_summary(spec)` → `api-summary.md`: endpoint table (method · path · description · auth required)

### Mode B — Greenfield API design

1. **Read NormalizedIntake**
   - Load `scope-intake-output.json`
   - Extract `core_features[]` and `existing_systems[]`

2. **Draft resource model**
   - AI step: derive REST resources (nouns) from features, or GraphQL types if `api_style=graphql`
   - Apply standard REST conventions: plural nouns, nested resources max 1 level deep, versioned `/v1/`

3. **Generate OpenAPI spec**
   - `draft_greenfield_spec(intake, api_style)` → `api.yaml`
   - Include: info block, servers block, auth scheme placeholder, paths per resource (GET list, GET by ID, POST, PUT, DELETE), request/response schemas

4. **Validate**
   - `validate_rest_conventions(spec)` — check naming, versioning, status codes, error schema

5. **Generate summary** — same as Mode A step 5

## Outputs

| Artifact | Path | Consumer |
|---|---|---|
| `api-spec.yaml` | `output_dir/` | db-designer · scope-proposal-workbook |
| `api-summary.md` | `output_dir/` | scope-proposal-workbook · client review |

## Handoffs

- → `db-designer` — pass `api-spec.yaml`; schema derives from API resource shapes
- → `scope-proposal-workbook` — pass both artifacts for proposal assembly
- → `storyboard-taskcrafter` — API endpoint list informs API integration stories

## Tool dependencies

| Tool | Install | Purpose |
|---|---|---|
| `mitmproxy` | `pip install mitmproxy` | HTTP traffic capture proxy |
| `mitmproxy2swagger` | `pip install mitmproxy2swagger` | Flow dump → OpenAPI spec |

## Lambda candidates

- `clean_openapi_spec(spec)` — pure YAML transform, idempotent
- `validate_rest_conventions(spec)` — pure linter
- `build_api_summary(spec)` — pure → markdown table
- `draft_greenfield_spec(intake, style)` — AI-assisted, cacheable by intake fingerprint
