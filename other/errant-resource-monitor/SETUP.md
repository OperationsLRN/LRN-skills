# SETUP: errant-resource-monitor

**Skill:** `deployer/errant-resource-monitor`
**Setup tier:** light
**Last verified:** 2026-06-03

## Dependencies

| Dep | Version | Install | Notes |
|---|---|---|---|
| AWS CLI | 2.x | `pip install awscli` or download | EC2, RDS, Lambda, CF, Cost Explorer |
| Python | 3.14 | present | orchestration |
| Ollama | running | present | phi4-mini classification (local, $0) |

## Credentials / vault

| Secret | Vault entry | How used |
|---|---|---|
| AWS credentials | `AWS/<profile>` (KeePass ai-hub.kdbx) | All AWS API calls |
| Telegram bot token | `Telegram/bot-token` (KeePass ai-hub.kdbx) | Checkpoint alert on orphan found |
| Telegram chat ID | `Telegram/chat-id` (KeePass ai-hub.kdbx) | Alert destination |

## .claude / harness wiring

None required for on-demand use.

For scheduled weekly use: add EventBridge rule → Lambda handler (see FUNCTIONS.md for Lambda candidates).

## Scheduled task / daemon

- **Recommended:** Weekly Monday 9 AM EventBridge → Lambda
- **Local alternative:** Windows Task Scheduler `\LRN\ErrantResourceMonitor` — weekly, `pythonw.exe`
- Register manually (auto-mode blocks schtasks):
  ```
  schtasks /Create /TN "\LRN\ErrantResourceMonitor" /XML "errant-resource-monitor.task.xml" /F
  ```

## How to run

Invoke: `G:\AI\skills\wip\deployer\errant-resource-monitor\SKILL.md`
Trigger: "scan for orphaned resources", "errant resource check", "unexpected AWS charges"

On-demand:
```bash
aws ec2 describe-addresses \
  --query 'Addresses[?AssociationId==null].[AllocationId,PublicIp]' \
  --output table --profile <PROFILE>
```

## Verify it works

1. Run `aws sts get-caller-identity --profile <profile>` — must succeed.
2. Provide a region with a known orphaned resource (e.g., unassociated EIP).
3. Run the skill.
4. Verify: orphan appears in `errant-resources-report.md`.
5. Verify: Telegram checkpoint fires if orphan-confirmed resources found.
