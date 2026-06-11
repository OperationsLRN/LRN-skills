# SKILL: qa-automation-suite

**Type:** kit
**Version:** 1.0.0
**Skills:** 18
**Tier:** premium
**Price:** $99–149
**Status:** stable
**Audience:** QA engineers, test automation leads, dev teams needing disciplined gates and automated test pipelines

## What this kit does

Every quality gate from first commit to production — test planning, security, load, release, and code review. Covers the full QA discipline stack: gating, triage, test creation, execution, telemetry, code review, security audit orchestration, and load testing.

## When to use this kit

- Setting up a QA pipeline on a new project from scratch
- Need dev-gate or release-gate before shipping
- Generating test cases from user stories or acceptance criteria
- Running a 5-stage automated test loop with Ollama repair
- Security auditing before a public release
- Load-testing an HTTP service, WebSocket endpoint, or mobile API
- Getting an 8-dimension code review on a PR diff
- Capturing test execution as ultra-compressed telemetry logs

## Skill index

| Skill | Role | What it does |
|---|---|---|
| `wip/qa-auditor` | namespace | Routes QA requests to sub-skills |
| `wip/qa-auditor/coverage-checker` | gate-input | Scores storyboard/brief completeness 0–100, returns gap list |
| `wip/qa-auditor/defect-triage` | triage | Classifies and prioritizes defect batches |
| `wip/qa-auditor/dev-gate` | gate | QA gate before dev handoff — blocks on failures |
| `wip/qa-auditor/release-gate` | gate | QA gate before release — final pre-ship checklist |
| `wip/qa-auditor/security-gate` | gate | OWASP Top 10 + STRIDE threat model before public release |
| `wip/qa-auditor/story-test-builder` | test-gen | FE + BE test scenarios per user story, LLM-recommended per type |
| `wip/qa-auditor/test-creator` | test-gen | Reads scope docs → generates exhaustive test files (AAA format) |
| `wip/qa-auditor/test-strategist` | planning | Classifies what tests to run, selects LLM per test category |
| `wip/exhaustive-test-generator` | test-gen | AC-driven FE/BE/E2E test stubs with TODO markers for ambiguous AC |
| `wip/developer/staged-test-runner` | execution | Staged test execution — runs passes in sequence with gate logic |
| `wip/test-loop-orchestrator` | execution | 5-stage test loop (static → simulated → integration → live → mobile) |
| `wip/test-loop-ug-ug-logger` | telemetry | Ultra-compressed JSONL test event capture (60–70% token savings) |
| `wip/test-loop-log-translator` | telemetry | Converts ug-ug JSONL logs to human-readable markdown reports |
| `wip/code-reviewer` | review | PR-style 8-dimension scoring + inline comment payload for `gh pr review` |
| `wip/attack-surface-scanner` | security | Pre-pentest attack surface enumeration + obfuscated string extraction |
| `wip/security-audit-router` | security | Orchestrates 6+ security skills by target type (pre-import/code/live/full-stack) |
| `wip/load-testing` | load | k6 + Vegeta load test wrapper — 5 profiles, SLO gating, Ollama result analysis |

**Intentionally excluded:** `wip/qa-auditor/semgrep-rule-creator` — CC-BY-SA-4.0 license conflicts with commercial pack license. Pull separately from the public skills repo.

## Quick start

1. Confirm prerequisites are met (see SETUP.md)
2. For a new project: start with `test-strategist` to classify what tests to generate
3. For story-driven test generation: `story-test-builder` → `exhaustive-test-generator`
4. For gated dev workflow: `dev-gate` (before handoff) → `release-gate` (before ship)
5. For security: `security-gate` → `security-audit-router` → `attack-surface-scanner`
6. For load: `load-testing` with profile `smoke` → escalate to `stress` or `soak`
7. For test execution loop: `staged-test-runner` → `test-loop-orchestrator`
8. For telemetry: enable `test-loop-ug-ug-logger` → `test-loop-log-translator` for team reports
9. For code review: `code-reviewer` on any PR diff

## Handoffs to other kits

| When you need... | Kit |
|---|---|
| Architecture gate before writing tests | dev-essentials (`arch-review`) |
| TDD red-green loop | dev-essentials (`staged-test-runner`) |
| Branching/PR SOPs | dev-essentials (`github-sop`) |
| Deployment pipeline after QA passes | Check free consolidated-dev-kit |
| Refactor pass on failing code | dev-essentials (`code-reviewer`) |

## White-label use

This kit is licensed for agency resale. Each buyer receives a single-seat license. Redistribution requires a separate commercial agreement. See LICENSE.md.
