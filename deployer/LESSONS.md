# Lessons Learned — deployer

| Lesson | Why it matters | Source |
|---|---|---|
| Extract deterministic helpers before calling AI for deployer. | Parsing, validation, routing, and manifests are cheaper and safer as pure functions. | FUNCTIONS.md classification |
| Make handoffs explicit instead of relying on chat context. | Downstream skills and agents need paths, payloads, and auth assumptions recorded in files. | SKILL.md handoffs |
