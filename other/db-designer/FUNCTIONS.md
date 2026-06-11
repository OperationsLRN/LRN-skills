# FUNCTIONS: db-designer

## Pure functions (Lambda candidates)

### `extract_existing_schema(mcp_connection, db_type) → dict`
- Queries DB via mcp-toolbox MCP server
- Returns: `{tables: [{name, columns: [{name, type, nullable, pk, fk_ref}], indexes: [], constraints: []}]}`
- DB-type-specific queries:
  - Postgres: `information_schema.columns` + `pg_constraint` + `pg_indexes`
  - MySQL: `information_schema.columns` + `KEY_COLUMN_USAGE`
  - SQLite: `PRAGMA table_info()` + `PRAGMA foreign_key_list()`

### `normalize_schema(raw_dict) → dict`
- Input: raw schema dict from extract_existing_schema
- Returns: canonical form with consistent field names, sorted tables/columns
- Adds: inferred relationship type (1:1, 1:N, M:N based on FK + unique constraints)
- Pure

### `generate_create_statements(schema, db_type) → str`
- Input: canonical schema dict
- Returns: SQL DDL string with:
  - `CREATE TABLE IF NOT EXISTS` per table
  - Column definitions with types, nullability, defaults
  - PRIMARY KEY, FOREIGN KEY, UNIQUE constraints
  - `CREATE INDEX` statements
- standard conventions applied: snake_case, `id SERIAL PRIMARY KEY`, `created_at TIMESTAMPTZ DEFAULT NOW()`, `updated_at TIMESTAMPTZ DEFAULT NOW()`
- Pure, deterministic

### `validate_naming_conventions(schema) → list[str]`
- Input: canonical schema dict
- Returns: list of violations (empty = clean)
- Checks:
  - Table names: plural, snake_case
  - Column names: snake_case, no reserved words
  - PK column named `id`
  - Timestamps present: `created_at`, `updated_at`
  - FK columns named `<referenced_table_singular>_id`
- Pure

### `export_chartdb_format(schema) → str`
- Input: canonical schema dict
- Returns: SQL DDL string formatted for paste into chartdb.io
- Equivalent to `generate_create_statements` but simplified for chartdb compatibility
- Pure

### `write_outputs(schema_sql, design_md, output_dir) → dict`
- Writes `schema.sql` and `db-design.md` to `output_dir`
- Returns: `{schema_path, design_path}`
- Creates output_dir if not exists

---

## AI-assisted steps

### `derive_entity_model(api_spec, intake) → schema_dict`
- Input: OpenAPI YAML string + NormalizedIntake dict
- AI prompt: map API resources → DB tables, identify M:N junctions, apply 3NF, add audit columns
- Output: canonical schema dict
- Model: sonnet
- Note: flag intentional denormalization explicitly in output

### `write_design_rationale(schema) → str`
- Input: canonical schema dict
- AI step: generate `db-design.md` with per-table description, relationship narrative, design decisions
- Output: Markdown string
- Model: sonnet

---

## External services

| Service | Auth | Purpose |
|---|---|---|
| `googleapis/mcp-toolbox` | DB credentials (DSN) | MCP server — live schema interrogation |
| `chartdb.io` | none (browser) | Paste SQL → visual ER diagram → export PNG |
