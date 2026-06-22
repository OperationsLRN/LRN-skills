# LESSONS: incident-response

## 2026-05-28 — Initial build

- phi4-mini is reliable for P1/P2/P3 classification but tends to over-classify as P1 when given ambiguous input — add a "default to P2 if uncertain" instruction in the prompt
- Runbooks should be service-specific where possible; generic runbooks (check logs, restart container) handle 80% of cases
- The `fire_alert` step should include the runbook step count in the message body so the on-call person knows how much work is ahead: "P1: mythicquill down — 6-step runbook ready"
- Postmortem should be written within 24h of resolution; add a Telegram reminder if `status == resolved` and no postmortem exists after 12h
- Incident state JSON must be append-only: never delete old incidents; archive after 30 days
- P3 incidents should still create a state file (for trend analysis) but not fire Telegram — noise reduction is critical for alert trust

## Attribution

- Pattern: internal clean-room implementation
- Runbook format inspired by PagerDuty runbook patterns (public documentation) — no code import
- phi4-mini severity classification: `G:\AI\routines\_lib_ollama.py` call pattern
