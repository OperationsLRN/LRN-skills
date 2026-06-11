# LESSONS: dev-essentials

**Kit:** dev-essentials · **Version:** v1.0.0

---

## 2026-05-28 — Kit assembly

- tdd, improve-codebase-architecture, and zoom-out are not in this kit by design — they are in the free consolidated-dev-kit. Buyers who expect TDD here will be confused. State this clearly in START_HERE.md and SKILL.md.
- repomix-pack token savings are meaningful (reported ~4500 tokens per session) but vary significantly by repo size. Do not promise a specific number in marketing copy; use "reduces context overhead" instead.
- local-project-env docker-compose template uses `host.docker.internal` for services that need to reach the host machine. This works on Mac and Windows Docker Desktop but not on Linux without `--add-host`. Document this in SETUP.md.
- careful-guard classification uses phi4-mini. Small local models can confabulate rule-following text without actually applying the rule — enforce destructive-command detection with a deterministic pattern list first, then send to phi4-mini only for genuinely ambiguous commands (see phi4-confabulation feedback in global memory).
- ps1-safe-script is the most cross-platform useful skill in this kit for Windows developers. Many buyers will be on Mac/Linux and may skip it. Make the trigger condition ("any PowerShell output") clear so non-Windows devs understand when it applies.

## 2026-05-29 — Buyer cold-test

- arch-review and arch-decision are frequently confused. Explain the distinction: arch-review = gate (pass/fail verdict on an existing design); arch-decision = record (locks a new decision going forward). They are meant to be used in sequence on a new project: arch-decision first (lock the stack), then arch-review before each build phase.
- github-sop is primarily written for AppsTango/QuassLabs branching conventions. Buyers from other orgs will need to adapt the branch naming patterns. Note in SETUP.md that SOP patterns are configurable.
- release-tagger behavior for repos with no existing tags: default is v0.1.0. Buyers who want to start at v1.0.0 need to pass `--start-version 1.0.0` explicitly. Document this.
- staged-test-runner requires tests to exist. If a repo has no test suite, the skill will pass every stage trivially. Pair with exhaustive-test-generator (qa-automation-suite) for repos without existing tests.

## 2026-06-09 — Kit penta build

- code-reviewer is shared with qa-automation-suite. Buyers who purchase both kits get the same skill. Document this at point of sale so it is not perceived as a duplicate charge.
- The most common first workflow for a solo dev: `arch-review` (gate) → write code → `code-reviewer` (review diff) → `staged-test-runner` (run tests) → `release-tagger` (tag). This sequence should be the primary example in START_HERE.md.
- repomix-pack should run before any large coding session or agent loop, not just before a code review. Reframe as a general context-preparation step rather than a code-review prerequisite.
