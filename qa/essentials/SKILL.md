# SKILL: dev-essentials

**Type:** kit
**Version:** v1.0.0
**Skills:** 10
**Tier:** starter
**Price:** $39
**Status:** stable
**Audience:** Solo developers, freelancers, Claude Code power users

## What this kit does

The 10 must-have skills for any developer agent — PR review, TDD loop, code review, architecture gate, destructive-op guard, PowerShell safety, branching SOPs, semantic versioning, context packing, and local dev environment setup.

## When to use this kit

- Starting a new feature or project and need an architecture gate before writing code
- Reviewing a PR diff for bugs, style issues, and scope creep
- Setting up a staged test execution pipeline in a new repo
- Need a guard against destructive shell commands
- Writing or reviewing PowerShell scripts on a Windows machine
- Standardizing branch naming, PR format, and release tags across a team
- Packing a large repo into LLM-ready context before a coding session
- Bootstrapping a local Docker dev stack (postgres, redis, n8n, wiremock)

## Skill index

| Skill | Role | What it does |
|---|---|---|
| `wip/code-reviewer` | review | PR-style 8-dimension diff review + inline comment payload for `gh pr review` |
| `wip/developer/arch-review` | gate | Pre-build architecture gate — data model, failure points, rollback locked before coding |
| `wip/developer/arch-decision` | decision | Architecture Decision Record — locks tech stack, APIs, DB schema before any story is written |
| `wip/developer/staged-test-runner` | execution | Staged test execution — sequential pass/fail gate across test phases |
| `wip/developer/careful-guard` | safety | Destructive-command guard (`/careful`) + scope lock (`/guard`) |
| `wip/ps1-safe-script` | safety | ASCII-only PowerShell gate — enforces safe encoding, file write patterns, Bash-first preference |
| `wip/github-sop` | process | Branch naming, PR template, README requirements, sprint cadence, AI agent rules |
| `wip/release-tagger` | process | Semver git tags + GitHub Releases; patch/minor/major decision tree; optional Docker image tags |
| `wip/repomix-pack` | context | Pack repo into LLM-ready context bundle — reduces token usage by ~4500 tokens per session |
| `wip/local-project-env` | setup | Per-project Docker + n8n bootstrap — generates docker-compose.local.yml + .env template |

**Not in this kit (available in free consolidated-dev-kit):** `tdd`, `improve-codebase-architecture`, `zoom-out`. Install the free kit first, then add dev-essentials.

## Quick start

1. Confirm prerequisites are met (see SETUP.md)
2. New project: run `arch-review` before writing any code
3. Before a PR: run `code-reviewer` on the diff
4. PowerShell work: gate through `ps1-safe-script` first
5. Tag a release: run `release-tagger` after merge
6. Pack context: run `repomix-pack` before a large coding session
7. Local stack: run `local-project-env` to generate docker-compose + .env

## Handoffs to other kits

| When you need... | Kit |
|---|---|
| Full QA pipeline (gates, test gen, load testing) | qa-automation-suite |
| TDD loop, architecture improvement, zoom-out | consolidated-dev-kit (free) |
| Deployment automation, Lambda scaffolding | Check skills hub for deployer/* skills |
| Security audit before release | qa-automation-suite (`security-gate`) |
