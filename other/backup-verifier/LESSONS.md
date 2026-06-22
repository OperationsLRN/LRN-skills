# LESSONS: backup-verifier

## 2026-05-28 — Initial build

- `max_age_hours: 25` (not 24) is the right default — allows for cron drift without false P1 alerts at hour 24:01
- S3 `aws s3 ls` with `--recursive` gives a per-file listing; sort by date and take the last entry — more reliable than `aws s3api list-objects` for this use case
- rclone `lsl` format: `{size} {date} {time} {path}` — date is YYYY-MM-DD, time is HH:MM:SS
- Spot-test restore should use a small file (<1MB) as sample_file to avoid slow Lambda/task runs; document this in config comments
- `send_report` should only fire red_gate on first failure, not on every check cycle — use a state file to track "already alerted" to prevent Telegram spam
- Local path checks on Windows: use `Path.stat().st_mtime` not `os.path.getmtime` for Unicode path safety
- When a backup target is temporarily offline (e.g. rclone remote unreachable), treat as WARN not immediate P1 — add `max_offline_minutes` config option

## Attribution

- Pattern: internal clean-room implementation
- rclone command patterns: rclone docs (MIT license project)
- boto3 S3 listing: AWS SDK documentation
