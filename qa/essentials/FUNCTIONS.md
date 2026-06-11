# FUNCTIONS: dev-essentials

**Kit:** dev-essentials · **Version:** v1.0.0

---

## Pure functions (Lambda candidates)

| Function | Skill | Signature | Lambda candidate | Notes |
|---|---|---|---|---|
| `score_diff_dimension(diff, dimension)` | code-reviewer | `(str, str) -> {score: int, findings: list}` | Conditional | Per-dimension; one LLM call each |
| `run_test_stage(stage_name, config)` | staged-test-runner | `(str, dict) -> {status, output, duration_ms}` | Yes — Step Functions | Fixed sequence; deterministic per stage |
| `validate_ps1_safety(script_text)` | ps1-safe-script | `(str) -> {issues: list, safe: bool}` | Yes | Regex + AST check; no LLM |
| `check_branch_name(branch)` | github-sop | `(str) -> {valid: bool, violations: list}` | Yes | Pattern match against SOP rules |
| `compute_next_version(current, change_type)` | release-tagger | `(str, str) -> str` | Yes | Pure semver bump logic |
| `pack_repo(root_path, budget_tokens)` | repomix-pack | `(str, int) -> {context: str, token_count: int}` | Yes | Deterministic file aggregation |
| `generate_compose(services, project_slug)` | local-project-env | `(list, str) -> str` | Yes | Template render; no LLM |
| `gate_verdict(check_results)` | arch-review | `(list[dict]) -> {verdict: PASS|FAIL|CONDITIONAL, blockers: list}` | Yes | Pure logic over check results |
| `write_adr(stack_decisions)` | arch-decision | `(dict) -> str` | Conditional | LLM for rationale; structure is deterministic |

---

## AI-assisted steps

| Step | Skill | Model | Reason | Est. tokens |
|---|---|---|---|---|
| Score PR diff (8 dimensions) | code-reviewer | sonnet | Semantic reasoning over diff | ~5k/PR |
| Architecture review verdict | arch-review | sonnet | Reasoning over data model + failure points | ~3k/review |
| Draft ADR rationale | arch-decision | sonnet | Trade-off analysis for stack choices | ~3k/ADR |
| Identify destructive intent | careful-guard | phi4-mini | Fast local classification of command intent | ~200/command |
| Classify PS1 safety violations | ps1-safe-script | phi4-mini | Ambiguous pattern resolution | ~300/script |
| Suggest release notes from merged PRs | release-tagger | sonnet | Summarize PR titles into release notes | ~2k/release |

---

## External services

| Service | Skill | Auth | Notes |
|---|---|---|---|
| GitHub CLI (`gh`) | code-reviewer, release-tagger, github-sop | `gh auth login` | Required for `--comment` mode and release creation |
| Ollama (local) | code-reviewer, careful-guard, ps1-safe-script | None (local) | phi4-mini for classification steps |
| Docker | local-project-env | None | Required to run generated docker-compose.local.yml |
| Repomix CLI | repomix-pack | None | `npm install -g repomix` |
| git | staged-test-runner, github-sop, release-tagger | SSH or HTTPS | Standard git auth |
