# LRN-skills

Claude Code skill library for OperationsLRN projects.

## How to use

Reference skills in your project's CLAUDE.md:

```markdown
| Task | Skill |
|------|-------|
| Gmail fetch/parse | ../LRN-skills/email-organizer/SKILL.md |
| Gmail OAuth/multi-account | ../LRN-skills/google-workspace-skill/SKILL.md |
| Any `aws` CLI command | ../LRN-skills/aws-cli-safe/SKILL.md |
| IAM / account setup | ../LRN-skills/aws-account-bootstrap/SKILL.md |
| Lambda / S3 deploy | ../LRN-skills/deployer/SKILL.md |
```

## Skills

See `REGISTRY.md` for the full index.

Each skill folder contains:
- `SKILL.md` — step-by-step instructions and handoffs
- `FUNCTIONS.md` — callable functions and external service specs
- `LESSONS.md` — corrections and improvements from production use

## AWS context (Lindsey CRM)

- Account: 201062409857
- Region: us-east-1
- Profile: `bot_userLRNgmailprocess`
- Always pass `--profile bot_userLRNgmailprocess --region us-east-1`
