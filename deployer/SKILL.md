# SKILL: deployer

**Bot:** developer · any
**Role:** Deployment runbook namespace — structured deployment workflows for Intelgic projects to AWS Amplify and web adapters.
**Caveman mode:** full
**Model:** haiku — deployment steps are deterministic; routing only at namespace level
**Tool compatibility:** Claude Code · Codex

## Model

**Verdict:** `phi4-mini` — namespace routing to deployment sub-skills is a deterministic dispatch with no generation required.

| Tier | Pick | Notes |
|---|---|---|
| Cloud | haiku | Routing-only; no reasoning needed |
| Local (installed) | phi4-mini | 2.5GB classifier; right-sized for dispatch |
| Local (ideal) | phi4-mini | Already installed; no upgrade needed |

---

## When to invoke

- "Deploy ballparker to AWS"
- "Run the web deployment for [project]"
- "Set up the Amplify pipeline"
- "Deploy the web adapter for ballparker"
- Any deployment task targeting AWS or web hosting

---

## What this namespace does

Deployer owns structured deployment runbooks. Each sub-skill covers a specific deployment target — currently AWS Amplify and web adapter deployments for the ballparker project. Deployer skills produce deterministic step-by-step instructions with rollback steps included.

---

## Sub-skills

| Sub-skill | What it does | Path |
|---|---|---|
| ballparker-aws | Deploy ballparker to AWS Amplify + Lambda | `G:\AI\skills\wip\deployer\ballparker-aws\SKILL.md` |
| ballparker-web-adapter | Deploy ballparker web adapter layer | `G:\AI\skills\wip\deployer\ballparker-web-adapter\SKILL.md` |

---

## Routing logic

```
Deploy to AWS Amplify / Lambda   → ballparker-aws
Deploy web adapter / proxy       → ballparker-web-adapter
```

---

## Key rules

- Always include rollback steps in any deployment runbook
- Never deploy to production without confirming environment (prod vs staging)
- Lambda candidates: deployment status polling, health check ping after deploy
- All deployment commands output to `G:\AI\output\deploy-logs\` for audit trail

---

## Handoffs

| Triggered by | Skill |
|---|---|
| Pre-deploy gate check | `G:\AI\skills\wip\qa-auditor\release-gate\SKILL.md` |
| AWS infrastructure provisioning | `G:\AI\skills\wip\aws-account-bootstrap\SKILL.md` |
| Notification on deploy success/failure | `G:\AI\skills\wip\notify\SKILL.md` |

## Input / Output spec

**Input:**
| Field | Type | Required | Notes |
|---|---|---|---|
| trigger | string | yes | Natural language phrase or sub-skill name to route to |
| target | string | yes | Deployment target; one of `ballparker-aws` or `ballparker-web-adapter` |
| environment | string | yes | `staging` or `production` — must be explicit; no default |
| aws_profile | string | no | Named AWS CLI profile to use; defaults to environment default credential chain |

**Output:**
```json
{
  "status": "ok | error",
  "result": {
    "routed_to": "ballparker-aws | ballparker-web-adapter",
    "environment": "staging | production",
    "reason": "why this sub-skill was selected",
    "next_action": "description of what the sub-skill will do next"
  }
}
```
