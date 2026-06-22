# SETUP: context-mode

**Skill:** `developer/context-mode`
**Setup tier:** none
**Last verified:** 2026-06-03

## Dependencies

| Dep | Version | Install | Notes |
|---|---|---|---|
stdlib only — no install

## Credentials / vault

None.

## .claude / harness wiring

None.

## Scheduled task / daemon

None.

## How to run

Invoke: `G:\AI\skills\wip\developer\context-mode\SKILL.md`
Trigger: "enable context mode", "sandbox tool outputs", "/context"

## Verify it works

1. Trigger context mode in a session.
2. Run a tool that produces large output (e.g. file read).
3. Verify: only the relevant excerpt reaches the model context window.
