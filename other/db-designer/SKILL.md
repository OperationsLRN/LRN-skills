# SKILL: db-designer
**Bot:** Scope Master
**Role:** Design client database schema from NormalizedIntake + API spec; produce migration SQL, design rationale doc, and visual diagram
**Ug-ug mode:** lite
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

- Scope requires a database design deliverable (new build or extension)
- Client has an existing database that must be documented and gap-analyzed
- api-designer has produced `api-spec.yaml` and schema needs to derive from it
- scope-proposal-workbook needs `schema.sql` + diagram as input

## Inputs

| Field | Type | Required |
|---|---|---|
| `mode` | `"existing_db"` \| `"greenfield"` | yes |
| `api_spec_path` | path to `api-spec.yaml` | for greenfield |
| `intake_path` | path to `scope-intake-output.json` | optional (augments greenfield) |
| `db_connection` | MCP connection string or DSN | for existing_db |
| `db_type` | `"postgres"` \| `"mysql"` \| `"sqlite"` \| `"mssql"` | yes |
| `output_dir` | path | optional (default: cwd) |

## Steps

### Mode A — Document existing database

1. **Connect via mcp-toolbox**
   - Wire `googleapis/mcp-toolbox` as MCP server against client's DB
   - Query: tables, columns, types, nullability, indexes, foreign keys, constraints
   - `extract_existing_schema(mcp_connection, db_type)` → raw schema dict

2. **Normalize and document**
   - `normalize_schema(raw_dict)` → canonical schema representation
   - AI step: write `db-design.md` — per-table description, column rationale, relationship map, identified issues (missing indexes, nullable PKs, circular FKs, inconsistent naming)

3. **Generate CREATE statements**
   - `generate_create_statements(schema)` → `schema.sql` (portable DDL)
   - Apply standard naming conventions (snake_case, `id` PK, `created_at`/`updated_at` timestamps)

4. **Visual diagram**
   - Paste `schema.sql` into [chartdb.io](https://chartdb.io) → export PNG
   - Save as `db-diagram.png` in `output_dir`

### Mode B — Greenfield schema design

1. **Read inputs**
   - Load `api-spec.yaml` — extract resource schemas from `components/schemas`
   - Load `scope-intake-output.json` — `core_features` + `tech_preferences.db`

2. **Derive entity model**
   - AI step: map API resources to DB tables, identify junction tables for M:N, add audit columns
   - Apply normalization (3NF minimum); flag intentional denormalization

3. **Generate CREATE statements**
   - `generate_create_statements(schema)` → `schema.sql`
   - Include: table DDL, indexes (PK, FK, common query columns), constraints, enum types

4. **Write design rationale**
   - `db-design.md`: table-by-table description, relationship diagram as ASCII, design decisions (e.g. "soft delete via `deleted_at` not hard delete")

5. **Visual diagram** — same as Mode A step 4

## Outputs

| Artifact | Path | Consumer |
|---|---|---|
| `schema.sql` | `output_dir/` | scope-proposal-workbook · dev team |
| `db-design.md` | `output_dir/` | scope-proposal-workbook · client review |
| `db-diagram.png` | `output_dir/` | scope-proposal-workbook (proposal slide) |

## Handoffs

- → `scope-proposal-workbook` — pass all three artifacts
- → `api-designer` — if schema reveals API resource gaps (circular dep: break by outputting schema first, then re-running api-designer with schema feedback)
- → `storyboard-taskcrafter` — DB table list informs data-model stories

## Tool dependencies

| Tool | Install | Purpose |
|---|---|---|
| `googleapis/mcp-toolbox` | see repo (Docker or binary) | MCP server for DB schema interrogation |
| `chartdb.io` | browser (no install) | SQL → visual DB diagram |

## Lambda candidates

- `extract_existing_schema(mcp_connection, db_type)` — deterministic query
- `normalize_schema(raw)` — pure transform
- `generate_create_statements(schema)` — pure, templated SQL output
- `validate_naming_conventions(schema)` — pure linter
