# LRN-skills — Skill Registry

Claude Code skills for OperationsLRN projects (Lindsey CRM and related).

| Skill | Path | Purpose |
|-------|------|---------|
| email-organizer | `email-organizer/SKILL.md` | Gmail fetch, parse, and ingest for CRM pipeline |
| google-workspace-skill | `google-workspace-skill/SKILL.md` | Google OAuth2 multi-account management |
| aws-cli-safe | `aws-cli-safe/SKILL.md` | Safe AWS CLI wrapping with profile enforcement |
| aws-account-bootstrap | `aws-account-bootstrap/SKILL.md` | IAM role + account setup |
| deployer | `deployer/SKILL.md` | Lambda zip+deploy + S3 frontend sync |

## Usage

Clone alongside the project repo:

```bash
git clone https://github.com/OperationsLRN/LRN-skills ../LRN-skills
```

Then reference skills from the project's CLAUDE.md using relative paths (`../LRN-skills/<skill>/SKILL.md`).
