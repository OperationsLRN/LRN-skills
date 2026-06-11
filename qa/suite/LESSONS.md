# LESSONS: qa-automation-suite

**Kit:** qa-automation-suite · **Version:** 1.0.0

---

## 2026-05-21 — Kit assembly

- semgrep-rule-creator excluded at kit level, not skill level — CC-BY-SA-4.0 share-alike incompatible with commercial pack. Document this clearly in manifest + SKILL.md so buyers know to pull it separately.
- coverage-checker score function is purely deterministic; no LLM needed for scoring. LLM is useful only for gap-description narration. Keep them separate so the scoring step can run as a Lambda.
- test-loop-orchestrator and staged-test-runner overlap in purpose for buyers who don't need the full 5-stage loop. Document the distinction: staged-test-runner = simple sequential pass/fail gate; test-loop-orchestrator = full Ollama repair loop + MindPalace state across resets.
- k6 is AGPL-3.0 — run locally only. Do not ship k6 binary or source inside the kit zip. Reference the install URL only.
- Vegeta is MIT — safe to document install instructions.
- ug-ug-logger compression ratio: measured 60–70% in NestGenie test sessions. Achievable because most log fields are repetitive across attempts.

## 2026-05-29 — First buyer cold-test

- Buyers expect a single entry-point command. "Read SKILL.md" is not enough. START_HERE.md must reference SETUP.md before SKILL.md — setup blockers are the #1 cold-start failure mode.
- phi4-mini required for defect-triage classification + test-loop repair routing. If Ollama is not running, the test loop stalls silently. Add an Ollama health check step to SETUP.md.
- Code review with `--comment` mode requires `gh auth login` with repo scope. Buyers often have gh installed but not authenticated. Add explicit auth check to SETUP.md.
- Load test SLO gating: `NEAR_MISS` verdict (p95 within 10% of threshold) is useful for staging but confusing in CI. Recommend treating NEAR_MISS as PASS in CI and flagging for human review in the report only.
- attack-surface-scanner requires Sn1per which is Linux-native. Windows buyers need WSL2 or Docker. Document this constraint prominently; do not list it as a simple prerequisite.

## 2026-06-09 — Kit penta build

- exhaustive-test-generator should be the first call when starting from an acceptance-criteria spec — it produces AAA stubs that test-creator can then flesh out. Reversed order loses the scaffold step.
- security-audit-router is the right entry point for any security work; calling individual security skills directly bypasses the routing logic and can leave gaps (e.g., missing supply-chain check when doing an internal-code audit).
- White-label buyers: the Ollama model list (phi4-mini + qwen2.5-coder:7b) is the minimum. Buyers with Mac mini M4 available should set OLLAMA_HOST to the Mac mini address for qwen2.5:7b calls — significantly faster than RTX 3060 for batch test generation.
- test-loop-log-translator output is the artifact to share with PMs/stakeholders. The .ug-ug.jsonl file is machine-readable only — never send raw to a non-technical recipient.
