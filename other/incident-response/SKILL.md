# SKILL: incident-response

**Bot:** any · ops · monitoring
**Role:** Structured runbook when a service goes down — triage checklist, escalation chain, rollback steps, postmortem template. Fires Telegram red_gate via notify.
**Ug-ug mode:** ultra
**Model:** phi4-mini — severity classification (local, $0); qwen2.5:7b — postmortem narrative
**Tool compatibility:** Claude Code · Cursor
**Status:** beta
**Parallelizable:** no — per-incident sequential; shared incident state file
**License:** proprietary
**Origin:** original
**Pack:** ops-resilience
**Commercial:** ready
**Tier:** starter

---

## When to invoke

- A service alert fires and you need a structured response
- "MythicQuill is down — what do I do?"
- Writing a postmortem after an incident is resolved
- Setting up incident runbooks for a new service
- Morning digest shows a service down overnight

---

## Permissions

| Type | Pattern | Why |
|---|---|---|
| Filesystem | `G:\AI\output\incidents\*` | Write incident state + postmortem files |
| Filesystem | `G:\AI\skills\wip\monitoring\incident-response\runbooks\*` | Read YAML runbooks |
| Network | `http://192.168.0.206:11434/*` | Ollama Mac mini — phi4-mini classify, qwen2.5:7b postmortem |
| Network | `http://localhost:11434/*` | Ollama local fallback |
| Bash | `python G:\AI\skills\wip\notify\notify.py *` | Fire Telegram alerts |

---

## Steps

### Step 1 — Classify incident

Call `classify_incident(alert)` using phi4-mini:

Prompt: "Classify this incident. Output: severity (P1/P2/P3) and category (infra/app/data/network). One line each."

Classification rules applied in phi4-mini prompt:
- P1: complete outage, data loss risk, revenue impact
- P2: degraded performance, partial outage, non-critical service down
- P3: minor issue, cosmetic, no user impact

Categories:
- infra: server down, Docker container crash, disk full, OOM
- app: exception rate spike, wrong output, feature broken
- data: DB corruption, backup failure, migration error
- network: DNS failure, cert expired, firewall blocking, DDoS

### Step 2 — Get runbook

Call `get_runbook(service, category)`:
- Load `runbooks/{category}.yaml`
- Extract steps for `service` key (or `default` if service not found)
- Return ordered checklist

### Step 3 — Fire alert

Call `fire_alert(severity, message)`:
- P1 → `notify.red_gate(title="P1 Incident", body=message)`
- P2 → `notify.checkpoint(title="P2 Incident", body=message)`
- P3 → log to incident state only (no Telegram)

### Step 4 — Execute runbook

Print runbook steps to stdout for operator to follow.
Write incident state to `G:\AI\output\incidents\{incident_id}.json`:
```json
{
  "incident_id": "INC-YYYYMMDD-HHMMSS",
  "service": "...",
  "severity": "P1",
  "category": "infra",
  "started_at": "...",
  "runbook_steps": [...],
  "status": "active"
}
```

### Step 5 — Postmortem (after resolution)

Call `write_postmortem(incident_id)`:
- Read incident state JSON
- Call qwen2.5:7b with timeline + runbook steps to fill postmortem template
- Write to `G:\AI\output\incidents\{incident_id}_postmortem.md`

Postmortem template sections:
1. Incident summary (what happened, when, duration)
2. Root cause
3. Timeline
4. Resolution steps taken
5. Action items to prevent recurrence

---

## Input / Output spec

**Input:**
```python
{
  "service": str,          # e.g. "mythicquill", "ollama", "uptime-kuma"
  "error_type": str,       # e.g. "500 errors", "container crash", "disk full"
  "alert_source": str,     # e.g. "uptime-kuma", "cloudwatch", "telegram"
  "severity_hint": str     # optional: "P1"|"P2"|"P3" override
}
```

**Output:**
```python
{
  "incident_id": str,
  "severity": str,
  "category": str,
  "runbook_steps": list[str],
  "alert_fired": bool,
  "state_path": str,
  "postmortem_path": str   # only set after write_postmortem() called
}
```

---

## Lambda / Step Functions candidates

| Function | Stateless? | Lambda? | Notes |
|---|---|---|---|
| `classify_incident(alert)` | yes | no | requires local Ollama (phi4-mini) |
| `get_runbook(service, category)` | yes | yes (if YAML on S3) | pure YAML lookup |
| `fire_alert(severity, message)` | yes | yes | delegates to notify Lambda |
| `write_postmortem(incident_id)` | no | no | reads/writes local incident state; Ollama |

---

## Handoffs

| Output | Next action | Path |
|---|---|---|
| P1 alert fired | Monitor + resolve | `G:\AI\skills\wip\monitoring\uptime-kuma\SKILL.md` |
| Resolution complete | Write postmortem | `write_postmortem(incident_id)` (this skill, Step 5) |
| Backup failure | Run backup-verifier | `G:\AI\skills\wip\monitoring\backup-verifier\SKILL.md` |
| Postmortem written | Add to knowledge base | `G:\AI\skills\wip\project-knowledge-query\SKILL.md` |
