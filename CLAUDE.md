# LRN-skills

Claude Code skill library for OperationsLRN projects.

## How to use

Reference skills in your project's CLAUDE.md:

```markdown
## Loaded skills — read before matching work

| Task | Skill |
|------|-------|
| Gmail fetch/parse | ../LRN-skills/email-organizer/SKILL.md |
| Gmail OAuth/multi-account | ../LRN-skills/google-workspace-skill/SKILL.md |
| Any `aws` CLI command | ../LRN-skills/aws-cli-safe/SKILL.md |
| IAM / account setup | ../LRN-skills/aws-account-bootstrap/SKILL.md |
| Lambda / S3 deploy | ../LRN-skills/deployer/SKILL.md |
| Output compression / ug-ug | ../LRN-skills/core/SKILL.md |
| Model routing | ../LRN-skills/core/SKILL.md |
| Code review | ../LRN-skills/qa/essentials/SKILL.md |
| QA gates / test generation | ../LRN-skills/qa/suite/SKILL.md |
| UI / Figma / frontend | ../LRN-skills/design/SKILL.md |
| Token cost reduction | ../LRN-skills/efficiency/SKILL.md |
```

Clone alongside your project repo:

```bash
git clone https://github.com/OperationsLRN/LRN-skills ../LRN-skills
```

## Skill map

See `REGISTRY.md` for the full index with deduplication notes.

## License

- `core/` — MIT (free, no restrictions). See `LICENSE-MIT.md`.
- `qa/`, `design/`, `efficiency/` — Trial license. See `LICENSE-TRIAL.md`.

## Updates

Check `UPDATES.md` — quarterly `git pull` recommended.
