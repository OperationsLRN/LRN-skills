# Lessons Learned — lambda-scaffolder

| Lesson | Why it matters | Source |
|---|---|---|
| Separate planning, execution, and verification outputs. | The skill is useful only when a later agent can see what changed and how it was checked. | SKILL.md workflow |
| Extract deterministic helpers before calling AI for lambda-scaffolder. | Parsing, validation, routing, and manifests are cheaper and safer as pure functions. | FUNCTIONS.md classification |
| Make handoffs explicit instead of relying on chat context. | Downstream skills and agents need paths, payloads, and auth assumptions recorded in files. | SKILL.md handoffs |
