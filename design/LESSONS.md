# Lessons — designer-toolkit

## 2026-06-09 — Kit-level review: Figma plugin as primary differentiator

The figma-plugin-nestgenie bundle is the feature that separates this kit from a plain skills collection. The actual buyer persona is a developer who inherits Figma designs and wants automated extraction rather than a native designer doing layout work. The plug-in demonstrates the exact pattern — base64 image embedding, frame targeting by name, no REST dependency — that any future Figma automation in this kit should follow. Lead with the plugin when pitching or onboarding.

## 2026-05-11 — Tool target: Claude Code, not Cursor

Per manifest: "Tool target: Claude Code primary. Cursor is weak at design per workspace policy. Codex acceptable for code-focused design work." Do not write setup instructions that assume Cursor. All skill invocations reference Claude Code CLI patterns.

## 2026-05-11 — MUI + Tailwind coexistence is a session-start concern, not a one-off fix

mui-tailwind-coexistence-guide is most effective when injected at session start for any project using both. A designer who opens a polish session without injecting this context will re-discover the same spacing and preflight conflicts the guide was built to prevent.

## 2026-05-11 — mermaid-prerender is mandatory for file:// deliverables

Any HTML deliverable opened from disk (not a live server) must use mermaid-prerender to convert Mermaid blocks to inline SVG before delivery. CDN-loaded Mermaid breaks under file:// CORS restrictions silently — no error, no diagram. Build this into every workflow that produces a handoff HTML file.
