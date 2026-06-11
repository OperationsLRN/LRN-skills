# FUNCTIONS: qa-automation-suite

**Kit:** qa-automation-suite · **Version:** 1.0.0

---

## Bundled scripts

These Python scripts are copied from the skills hub into the kit distribution in Phase 3. Source paths are listed for reference; recipients receive the scripts at the root of the kit folder.

| Script | Source path | What it does |
|---|---|---|
| `lint_skill.py` | `G:\AI\skills\wip\meta\skill-linter\lint_skill.py` | Validates SKILL.md format — required headers, ug-ug level, required sections. Exit 0 = pass, 1 = errors. CLI: `python lint_skill.py <path/to/SKILL.md>` |
| `handoff_validator.py` | `G:\AI\skills\wip\handoff-validator\handoff_validator.py` | Walks SKILL.md files, extracts every handoff reference, resolves each path, reports broken links. CLI: `python handoff_validator.py --root <skills-root>` |

**Phase 3 note:** copy step not yet automated. Add to `build_kit.py` copy manifest before packaging.

---

## Pure functions (Lambda candidates)

Functions that are deterministic, I/O-bound, or structurally suitable for extraction into Lambda handlers.

| Function | Skill | Signature | Lambda candidate | Notes |
|---|---|---|---|---|
| `score_coverage(storyboard, brief)` | coverage-checker | `(dict, dict) -> {score: int, gaps: list}` | Yes | Pure scoring math; no LLM needed |
| `classify_defect(defect_text)` | defect-triage | `(str) -> {severity, category, priority}` | Yes — phi4-mini | Deterministic classification with small model |
| `run_test_stage(stage_name, config)` | staged-test-runner | `(str, dict) -> {status, output, duration_ms}` | Yes — Step Functions | Fixed test sequence per stage |
| `compress_log_event(event)` | test-loop-ug-ug-logger | `(dict) -> str` | Yes | Deterministic compression; no LLM |
| `parse_ug_ug_log(jsonl_path)` | test-loop-log-translator | `(str) -> list[dict]` | Yes | File read + parse; no LLM |
| `score_diff_dimension(diff, dimension)` | code-reviewer | `(str, str) -> {score: int, findings: list}` | Conditional | Per-dimension scoring; LLM per dimension |
| `build_k6_script(profile, target_url, slo)` | load-testing | `(str, str, dict) -> str` | Yes | Template rendering; deterministic |
| `parse_k6_results(json_output)` | load-testing | `(dict) -> {status, p95_ms, p99_ms, error_rate}` | Yes | Pure math on JSON summary |
| `enumerate_attack_surface(target)` | attack-surface-scanner | `(str) -> {endpoints: list, findings: list}` | Conditional — needs Sn1per | Requires external tool; EC2/local only |
| `gate_verdict(check_results)` | dev-gate / release-gate | `(list[dict]) -> {verdict: PASS|FAIL|CONDITIONAL, blockers: list}` | Yes | Pure logic over check results |

---

## AI-assisted steps

| Step | Skill | Model | Reason | Est. tokens |
|---|---|---|---|---|
| Generate test scenarios per story | story-test-builder | sonnet | Semantic matching of AC to test types | ~2k/story |
| Classify defect severity | defect-triage | phi4-mini | Fast local classification, no cloud cost | ~200/defect |
| Synthesize test strategy | test-strategist | sonnet | Reasoning over scope + stack to decide test mix | ~3k/session |
| Generate exhaustive test stubs | exhaustive-test-generator | sonnet | AC → structured test files | ~4k/story |
| Code repair in test loop | test-loop-orchestrator | qwen2.5-coder:7b | Local repair loop (3+ attempts before escalate) | ~1k/attempt |
| Score PR diff (8 dimensions) | code-reviewer | sonnet | Semantic reasoning over diff per dimension | ~5k/PR |
| Analyze load test results | load-testing | qwen2.5:7b | Local summary + anomaly commentary | ~1k/run |
| STRIDE threat modeling | security-gate | sonnet | Threat enumeration from architecture context | ~4k/review |
| Route security checks | security-audit-router | phi4-mini | Fast target-type classification | ~300/route |

---

## External services

| Service | Skill | Auth | Notes |
|---|---|---|---|
| Ollama (local / Mac mini) | test-loop-orchestrator, code-reviewer, load-testing | None (local) | phi4-mini + qwen2.5-coder:7b must be pulled |
| k6 | load-testing | None | CLI install required; see SETUP.md |
| Vegeta | load-testing | None | CLI install required; see SETUP.md |
| InfluxDB (optional) | load-testing | None | docker-compose template included for metrics storage |
| Grafana (optional) | load-testing | None | Pairs with InfluxDB for load dashboards |
| Sn1per (optional) | attack-surface-scanner | None | Requires local install; EC2/local only |
| GitHub CLI (`gh`) | code-reviewer | `gh auth login` | Required for `--comment` mode to post inline PR comments |
