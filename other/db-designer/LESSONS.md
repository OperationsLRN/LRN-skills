# Lessons Learned — db-designer

## 2026-05-16 — Initial implementation

- **chartdb.io is the fastest path to a client-facing diagram** — paste `schema.sql` → browser renders ER diagram instantly, no install. Export PNG for the proposal. Don't spend time in draw.io or dbdiagram.io — chartdb reads raw SQL directly.

- **mcp-toolbox for live schema interrogation** — connect as MCP server against the client's dev/staging DB to get the ground-truth schema including indexes, constraints, and FK relationships that aren't always in migration files. Don't trust ORM model definitions alone — query the actual DB.

- **Always add audit columns** — `created_at`, `updated_at`, `deleted_at` (soft delete). Standard pattern. Clients resist at first; they always need them later.

- **3NF minimum, intentional denormalization documented** — any deviation from 3NF must be flagged in `db-design.md` with the reason (e.g. "user.full_name is denormalized from profile for query performance on the feed"). Silent denormalization creates confusion during code review.

- **FK naming is load-bearing** — column named `<table_singular>_id` (e.g. `user_id` references `users.id`). Inconsistent naming breaks ORM auto-inference and causes bugs. Enforce via `validate_naming_conventions()` before writing final schema.

- **Circular dependency between api-designer and db-designer** — API resource shapes → DB schema, but DB constraints sometimes push back to API shape. Break the cycle: run api-designer first (greenfield draft), then db-designer, then optionally feed schema back to api-designer to add missing fields to response schemas.

## Repo additions — 2026-05-16 triage

Source: `G:\AI\items_of_note\github-repos.md` → "Full triage — 2026-05-16".

- **`googleapis/mcp-toolbox` (15k★)** — MCP server for DB-backed queries. Wire against client's dev/staging DB to interrogate live schema: tables, columns, types, indexes, foreign keys, constraints. Use for Mode A (existing DB documentation). Run via Docker or binary; connect as MCP server in Claude Code `.mcp.json`. See repo for DB-type-specific setup (Postgres, MySQL, SQLite, BigQuery, AlloyDB).

- **`chartdb/chartdb` (22k★, upgraded Pull-in 2026-05-16)** — DB diagram editor that reads raw SQL (`CREATE TABLE` statements). Paste `schema.sql` output into chartdb.io → instant ER diagram → export PNG for client proposals. No account needed for basic use. Wire as the visual output step for all db-designer runs — the PNG goes directly into the scope deck.
