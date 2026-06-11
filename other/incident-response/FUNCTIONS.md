# FUNCTIONS: incident-response

## Pure functions (Lambda candidates)

| Function | Input | Output | Notes |
|---|---|---|---|
| `get_runbook` | `service: str, category: str` | `list[str]` | YAML lookup; Lambda-ready if YAML on S3 |
| `fire_alert` | `severity: str, message: str` | `None` | Delegates to notify skill |

## Key functions

| Function | Signature | What it does |
|---|---|---|
| `classify_incident` | `(alert: dict) -> dict[severity, category]` | phi4-mini classifies P1/P2/P3 + infra/app/data/network |
| `get_runbook` | `(service: str, category: str) -> list[str]` | Load runbooks/{category}.yaml; return steps for service or default |
| `fire_alert` | `(severity: str, message: str) -> None` | P1=red_gate, P2=checkpoint, P3=log only |
| `write_postmortem` | `(incident_id: str) -> Path` | qwen2.5:7b fills postmortem template from incident state JSON |
| `create_incident` | `(alert: dict) -> dict` | Full pipeline: classify + runbook + fire alert + write state |

## AI-assisted steps

| Step | Model | Est tokens | Why |
|---|---|---|---|
| Classify severity + category | phi4-mini | ~400 | Fast local classification; deterministic enough at this granularity |
| Postmortem narrative | qwen2.5:7b | ~2000 | Structured incident timeline + action items |

## External services

| Service | Endpoint | Auth | Notes |
|---|---|---|---|
| Ollama Mac mini | `http://192.168.0.206:11434/api/generate` | None | phi4-mini + qwen2.5:7b |
| Ollama local | `http://localhost:11434/api/generate` | None | Fallback |
| notify skill | `G:\AI\skills\wip\notify\notify.py` | Telegram token via env | P1=red_gate, P2=checkpoint |

## Runbook YAML schema

`runbooks/{category}.yaml`:
```yaml
default:
  - "Check service status: docker ps | grep {service}"
  - "Check recent logs: docker logs {service} --tail 50"
  - "Check disk space: df -h"
  - "Check memory: free -h"
  - "Attempt restart: docker compose restart {service}"

mythicquill:
  - "Check EC2 instance health in AWS console"
  - "Check CloudWatch logs for recent errors"
  - "SSH to instance and check application logs"
  - "Check RDS connection: psql $DATABASE_URL -c 'SELECT 1'"
```

## State file schema

`G:\AI\output\incidents\{incident_id}.json`:
```json
{
  "incident_id": "INC-20260528-143022",
  "service": "mythicquill",
  "severity": "P1",
  "category": "infra",
  "error_type": "container crash",
  "alert_source": "uptime-kuma",
  "started_at": "2026-05-28T14:30:22",
  "runbook_steps": ["step 1", "step 2"],
  "status": "active",
  "resolved_at": null
}
```
