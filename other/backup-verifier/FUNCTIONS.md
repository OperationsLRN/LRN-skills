# FUNCTIONS: backup-verifier

## Pure functions (Lambda candidates)

| Function | Input | Output | Notes |
|---|---|---|---|
| `check_backup_age` | `target: dict, max_age_hours: int` | `dict[pass, last_backup_ts, age_hours]` | mtime for local; s3 ls for S3; rclone lsl for rclone |
| `verify_file_count` | `target: dict, min_files: int` | `dict[pass, count]` | count objects in backup location |
| `spot_test_restore` | `target: dict, sample_file: str` | `dict[pass, checksum, size_bytes]` | download + verify; optional (--spot flag) |
| `send_report` | `results: list` | `None` | delegates to notify red_gate/checkpoint |

## Key functions

| Function | Signature | What it does |
|---|---|---|
| `check_backup_age` | `(target: dict, max_age_hours: int) -> dict` | Find most recent file mtime; compare to threshold |
| `verify_file_count` | `(target: dict, min_files: int) -> dict` | Count files; compare to min |
| `spot_test_restore` | `(target: dict, sample_file: str) -> dict` | Download one file; verify readable + non-empty |
| `send_report` | `(results: list, dry_run: bool = False) -> None` | Fire Telegram; write results JSON |
| `run_all` | `(config_path: Path, spot: bool, dry_run: bool) -> dict` | Load config; run all checks; aggregate |

## AI-assisted steps

None — fully deterministic. No LLM needed.

## External services

| Service | Endpoint | Auth | Notes |
|---|---|---|---|
| AWS S3 | `s3://{bucket}/{prefix}` | boto3 default credentials | `aws s3 ls` via subprocess |
| rclone | rclone remote | rclone config file | `rclone lsl {remote}:{path}` via subprocess |
| Telegram (via notify) | Telegram Bot API | `TELEGRAM_BOT_TOKEN` env | P1 red_gate or checkpoint |

## Config YAML schema

```yaml
targets:
  - name: "PostgreSQL daily backup"
    type: local
    path: "/var/backups/postgres"
    max_age_hours: 25
    min_files: 1
    sample_file: "latest.sql.gz"

  - name: "S3 MythicQuill assets"
    type: s3
    path: "s3://mythicquill-backups/daily/"
    max_age_hours: 25
    min_files: 3
    sample_file: null

  - name: "rclone Backblaze"
    type: rclone
    path: "backblaze:ai-hub-backup"
    max_age_hours: 48
    min_files: 1
    sample_file: null
```

## Return type for `run_all`

```python
{
    "results": [
        {
            "name": str,
            "type": str,
            "age_ok": bool,
            "count_ok": bool,
            "restore_ok": bool | None,
            "last_backup_ts": str,     # ISO format
            "age_hours": float,
            "file_count": int,
            "error": str | None        # set if check threw an exception
        }
    ],
    "overall": str,    # "pass" or "fail"
    "failures": list[str]
}
```
