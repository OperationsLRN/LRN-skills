# QA Automation Suite · v1.0.0

**The full QA discipline stack for AI-driven engineering workflows.**

A premium pack for QA engineers, test automation leads, and dev teams that need disciplined quality gates, AC-driven test generation, automated test execution, code review at PR-time, security audit orchestration, and load testing — all wired into a Claude Code / Codex / Cursor session with ug-ug-style token efficiency built in.

---

## What's inside (18 skills)

### Gates — block bad code before it ships

| Skill | What it does |
|---|---|
| **qa-auditor/dev-gate** | Pre-dev-handoff gate: design + test plan + acceptance criteria checks |
| **qa-auditor/release-gate** | Pre-release gate: coverage + regression + smoke test enforcement |
| **qa-auditor/security-gate** | OWASP Top 10 + STRIDE threat model audit before public release |

### Triage — classify what's broken + how much is covered

| Skill | What it does |
|---|---|
| **qa-auditor/defect-triage** | Triages defects by severity / category / regression-vs-new |
| **qa-auditor/coverage-checker** | Scores ballpark/storyboard vs input brief — 0–100 + gap list |

### Test generation — from stories + ACs to executable tests

| Skill | What it does |
|---|---|
| **qa-auditor/test-strategist** | Picks test strategy (unit/integration/e2e/manual/mixed) per story |
| **qa-auditor/story-test-builder** | FE + BE test scenarios per user story w/ LLM model rec per type |
| **qa-auditor/test-creator** | Drafts individual test cases from gathered scenarios |
| **exhaustive-test-generator** | Reads storyboard AC + Impl Steps → FE/BE/E2E test files per story. AAA format enforced. |

### Execution — run tests in disciplined order

| Skill | What it does |
|---|---|
| **developer/tdd** | Red-green-refactor TDD with vertical-slice discipline |
| **developer/staged-test-runner** | Run tests in staged passes (smoke → core → edge → integration) |
| **test-loop-orchestrator** | 5-stage exhaustive test loop (static → simulated → integration → live screen → mobile) with Ollama validation at each gate |

### Telemetry — capture + translate test runs

| Skill | What it does |
|---|---|
| **test-loop-ug-ug-logger** | Capture test runs to ultra-compressed JSON lines. 60–70% token savings vs human-readable logs. |
| **test-loop-log-translator** | Convert ug-ug JSON logs → human-readable markdown report for team review |

### Review — PR-time + cross-cutting

| Skill | What it does |
|---|---|
| **code-reviewer** | PR-style single-diff review — 8-dimension scoring (correctness · readability · tests · security · perf · style · scope-creep · conflicts) + inline-comment payload ready for `gh pr review` |
| **security-audit-router** | Orchestrator chaining 6+ security skills by target type (pre-import / internal-code / live-service / full-stack). CLEAR / CONDITIONAL / BLOCK verdict. |
| **load-testing** | k6 + Vegeta wrapper with 5 profiles (smoke/load/stress/spike/soak). SLO-gated PASS/NEAR_MISS/FAIL. |

---

## Pipeline order

See `PIPELINE-DIAGRAM.md` for the canonical chain. Quick version:

```
test-strategist → story-test-builder + test-creator (or exhaustive-test-generator)
              ↓
              dev-gate → tdd OR test-loop-orchestrator
                      ↓
                      test-loop-ug-ug-logger (during run)
                      ↓
                      test-loop-log-translator (after run)
                      ↓
                      code-reviewer (per PR)
                      ↓
                      coverage-checker → release-gate
                      ↓
                      security-audit-router → security-gate
                      ↓
                      load-testing (pre-prod)
                      ↓
                      defect-triage (when issues land in prod)
```

---

## How to install

1. Unzip into any directory.
2. Copy the `skills/` subtree into your Claude Code project at `.claude/skills/` OR your user-global at `~/.claude/skills/`.
3. The QA pack pairs with the **Core/Default Kit** — if you don't have it, `task-router` + `llm-selector` are referenced by some QA skills for cost-efficient routing.
4. Per-skill SKILL.md files document trigger phrases. The `qa-auditor` namespace SKILL.md is the entry point — read it first.

---

## What's NOT included

- **semgrep-rule-creator** — intentionally excluded. License is CC-BY-SA-4.0 (share-alike), incompatible with this pack's custom-commercial license. Pull it separately from the future public QuassLabs-OSS repo when available.
- **integrations** — Jira / Linear / Notion / Slack CRUD wrappers (sold separately; need your accounts)
- **scope-master** — story / API / DB design + estimation workbook (sold separately; enterprise tier)

---

## License

See `LICENSE.md`. Custom-commercial single-purchaser. You may use, modify, and combine these skills in your own projects (commercial OK). You may NOT redistribute the pack or resell any individual skill from it.

---

## Support

This is a self-serve code library. Purchase includes raw files, docs, and v1.x patch releases. Commercial support contracts and white-label rights via the seller page.

---

## Source attribution

External open-source patterns referenced (clean-room implementations; no third-party source code bundled):

- **k6** (grafana/k6, AGPL-3.0, local-only use) — `load-testing` patterns
- **vegeta** (tsenart/vegeta, MIT) — `load-testing` HTTP load profiles
- **graphify** (safishamsi/graphify, Apache 2.0) — referenced by `code-reviewer` codegraph mode (DELEGATED to separate `graphify-rag` skill; not bundled here)
- **trivy** (aquasecurity/trivy, Apache 2.0) — `security-audit-router` invocation pattern
- **osv-scanner** (google/osv-scanner, Apache 2.0) — `security-audit-router` CVE check
- **pip-audit** (pypa/pip-audit, Apache 2.0) — `security-audit-router` Python deps

Full attribution per skill in its own `LESSONS.md` file under "Pattern attribution".
