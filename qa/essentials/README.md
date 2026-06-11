# Dev Essentials — v1.0.0

**Price:** $39 · **Tier:** Starter · **License:** Custom Commercial (single-user)

10 skills for the full development loop — code review, TDD, architecture gates, test running, refactoring, branching SOP, and release tagging. Built for solo devs and Claude Code power users.

Built on a mix of original QuassLabs work and clean-room implementations of open-source patterns. Full attribution in [CREDITS.md](CREDITS.md).

## What's included

| Skill | What it does |
|---|---|
| `code-reviewer` | PR-style diff review — 8 dimensions + inline comment payload for `gh pr review` |
| `arch-review` | Pre-build architecture gate — data model, failure points, rollback locked before coding |
| `arch-decision` | ADR writing — locks tech stack, APIs, DB schema into a decision record before any story is written |
| `staged-test-runner` | Run tests in staged passes — static → unit → integration → E2E |
| `careful-guard` | Destructive command guard (/careful) + scope lock (/guard) — prevents irreversible actions |
| `ps1-safe-script` | PowerShell safety rules — ASCII-only strings, UTF-8 I/O, Bash escape safety |
| `github-sop` | Branching SOP — feature/* → dev → release → staging → main → prod tag |
| `release-tagger` | Semver git tags + GitHub Releases — draft release notes from merged PRs |
| `repomix-pack` | Package repo with Repomix before large coding sessions — cuts token waste on context loading |
| `local-project-env` | One-command Docker + N8N local dev stack — postgres, redis, wiremock, optional Ollama |

> **Note:** tdd, improve-codebase-architecture, and zoom-out are in the free starter kit. Get those there first — this kit picks up where the free kit leaves off.

## Requirements

- Claude Code CLI
- Git + GitHub CLI (`gh`)
- Node.js (for some test-runner patterns)

## Install

See `START_HERE.md` for the first-session paste block.
