# SKILL: backup-verifier

**Bot:** any · ops · monitoring
**Role:** Confirm backup jobs ran, check file age, spot-test a restore, alert if stale. Works with S3, local folder, Backblaze, or rclone remote.
**Ug-ug mode:** ultra
**Model:** none — fully deterministic; no LLM required
**Tool compatibility:** Claude Code · Cursor
**Status:** beta
**Parallelizable:** conditional — yes if separate target configs per run
**License:** proprietary
**Origin:** original
**Pack:** ops-resilience
**Commercial:** ready
**Tier:** starter

---

## When to invoke

- Nightly cron: "did my backups run last night?"
- Before a deploy: "do I have a good backup to roll back to?"
- After a backup job completes: "verify this backup is intact"
- Scheduled: wire to Windows Task Scheduler nightly via ops-automation patterns
- After a data incident: "restore one file and confirm it's readable"

---

## Permissions

| Type | Pattern | Why |
|---|---|---|
| Filesystem | local backup paths in config | Check local backup directories |
| Bash | `aws s3 ls *` | Check S3 backup targets |
| Bash | `rclone lsd *` | Check rclone remote targets |
| Bash | `python G:\AI\skills\wip\monitoring\backup-verifier\backup_verifier.py *` | Run verifier |

---

## Steps

### Step 1 — Load config

Load `backup-config.yaml`. Each entry has:
- `name`: human label
- `type`: `local` | `s3` | `rclone`
- `path`: local path, S3 URI (s3://bucket/prefix), or rclone remote:path
- `max_age_hours`: alert if most recent backup older than this
- `min_files`: alert if fewer than this many files in backup location
- `sample_file`: optional; used for spot-test restore

### Step 2 — Check backup age

Call `check_backup_age(target, max_age_hours)`:
- `local`: `max(mtime for f in Path(path).rglob("*") if f.is_file())`
- `s3`: `aws s3 ls {path} --recursive --human-readable` → parse most recent timestamp
- `rclone`: `rclone lsl {path}` → parse most recent modification time
- Return `{pass, last_backup_ts, age_hours}`

### Step 3 — Verify file count

Call `verify_file_count(target, min_files)`:
- Count objects/files in backup location
- Return `{pass, count}`

### Step 4 — Spot-test restore (optional)

Call `spot_test_restore(target, sample_file)` when `--spot` flag passed:
- Download `sample_file` to temp location
- Compute SHA-256 checksum
- Verify file is non-empty and readable (text: 5 lines; binary: magic bytes)
- Return `{pass, checksum, size_bytes}`

### Step 5 — Send report

Call `send_report(results)`:
- All checks pass → `notify.checkpoint("Backup Verify", summary)` (optional)
- Any check fails → `notify.red_gate("Backup STALE", details)`
- Write results JSON to `G:\AI\output\backup-verify\{date}_results.json`

---

## Input / Output spec

**Config file:** `backup-config.yaml` (path configurable, default: `G:\AI\configs\backup-config.yaml`)

**CLI:**
```bash
python backup_verifier.py [--config path/to/backup-config.yaml] [--spot] [--dry-run]
```
- `--spot`: run spot-test restore for each target with `sample_file` configured
- `--dry-run`: check + report, do not fire Telegram alerts

**Output:**
```python
{
  "results": [
    {
      "name": str,
      "type": str,
      "age_ok": bool,
      "count_ok": bool,
      "restore_ok": bool | None,
      "last_backup_ts": str,
      "age_hours": float,
      "file_count": int
    }
  ],
  "overall": "pass" | "fail",
  "failures": list[str]
}
```

---

## Lambda / Step Functions candidates

| Function | Stateless? | Lambda? | Notes |
|---|---|---|---|
| `check_backup_age` | yes | yes (S3 target) | needs boto3 for S3 |
| `verify_file_count` | yes | yes (S3 target) | needs boto3 for S3 |
| `spot_test_restore` | yes | yes (to /tmp) | 512MB /tmp limit in Lambda |
| `send_report` | yes | yes | delegates to notify Lambda |

Full Lambda pipeline viable for S3 targets. Local path targets require EC2/local runner.

---

## Handoffs

| Output | Next action | Path |
|---|---|---|
| Backup stale (P1) | Run incident-response | `G:\AI\skills\wip\monitoring\incident-response\SKILL.md` |
| Restore failed | Investigate backup job | Check cron/Task Scheduler logs |
| All pass | Log to daily-digest | `G:\AI\routines\daily-digest.py` |
