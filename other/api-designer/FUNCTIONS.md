# FUNCTIONS: api-designer

## Pure functions (Lambda candidates)

### `run_mitmproxy2swagger(flow_path, base_url, output_path) → str`
- Subprocess: `mitmproxy2swagger -i <flow_path> -o <output_path> -p <base_url> --examples`
- Returns: raw OpenAPI YAML string (reads output_path)
- Raises: `Mitmproxy2SwaggerError` on non-zero exit
- Idempotent

### `clean_openapi_spec(spec_yaml) → str`
- Input: raw OpenAPI YAML string (may have FIXMEs, duplicate paths, missing schemas)
- Returns: cleaned YAML string
- Actions:
  - Remove exact-duplicate path+method entries
  - Replace null response schemas with `{type: object}` placeholder
  - Flag remaining `FIXME` strings in returned string with `# REVIEW:` prefix
- Pure

### `validate_rest_conventions(spec_yaml) → list[str]`
- Input: OpenAPI YAML string
- Returns: list of violation strings (empty = valid)
- Checks:
  - All paths start with `/v1/` (versioned)
  - Resource nouns are plural
  - No path nesting deeper than 2 levels (`/v1/resource/{id}/sub`)
  - GET responses have 200 schema defined
  - POST/PUT have request body schema defined
  - Error responses (400, 401, 404, 500) present on all paths
- Pure

### `build_api_summary(spec_yaml) → str`
- Input: OpenAPI YAML string
- Returns: Markdown table:
  ```
  | Method | Path | Description | Auth |
  ```
- Groups by tag; alphabetical within tag
- Pure

### `write_spec(spec_yaml, summary_md, output_dir) → tuple[str, str]`
- Writes `api-spec.yaml` and `api-summary.md` to `output_dir`
- Returns: (spec_path, summary_path)
- Creates output_dir if not exists

---

## AI-assisted steps

### `draft_greenfield_spec(intake, api_style) → str`
- Input: NormalizedIntake dict, `"rest"` | `"graphql"`
- AI prompt: derive resource model from `core_features` + standard REST conventions
- Output: OpenAPI 3.0 YAML string (REST) or SDL string (GraphQL)
- Model: sonnet
- Cacheable: fingerprint on `{core_features_hash, api_style}`

### `annotate_auth_scheme(spec_yaml, captured_headers) → str`
- Input: OpenAPI YAML + list of captured Authorization/Cookie headers
- AI step: infer auth scheme (Bearer JWT / API key / session cookie / OAuth2)
- Returns: spec with `securitySchemes` block added and `security` applied per endpoint
- Model: sonnet (short prompt)

---

## External services

| Service | Auth | Purpose |
|---|---|---|
| `mitmproxy` | none (local) | HTTP proxy for traffic capture |
| `mitmproxy2swagger` | none (local CLI) | Flow dump → OpenAPI 3.0 |
