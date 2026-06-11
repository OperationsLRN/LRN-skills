# SKILL: designer-toolkit

**Type:** kit
**Version:** 1.0.0
**Skills:** 26
**Tier:** custom-commercial
**Status:** stable
**Audience:** Designers and design-adjacent devs using Claude Code

## What this kit does

Covers the full design phase without copy-pasting: Figma import/export, screen specs, interactive HTML prototypes, flow diagrams, and frontend polish — plus a production Figma plug-in as a runnable reference implementation. Ships design tokens, components, and handoff artifacts directly from Claude Code.

## When to use this kit

- Starting a new screen spec from a design brief or storyboard
- Building an interactive HTML prototype for client review or pre-sale
- Exporting assets or design tokens from Figma into code
- Generating flow diagrams or editorial SVGs for a scope doc or handoff
- Running a frontend polish pass (spacing, MUI+Tailwind conflicts, state coverage)
- Needing a reference implementation for a custom Figma plug-in

## Skill index

### Core
| Skill | Role | What it does |
|---|---|---|
| `wip/ug-ug` | core | Compressed output modes for agent sessions |
| `wip/memory/memory-ladder` | core | Cross-session memory (7-layer file-based) |
| `wip/lifecycle/agent-setup-wizard` | core | Bootstrap new project with CLAUDE.md + AGENTS.md |
| `wip/lifecycle/project-env-setup` | core | Local dev stack scaffold (Docker, .env template, memory config) |
| `wip/meta/skillmaster` | core | Hub lifecycle — build, lint, promote skills |
| `wip/meta/skill-builder` | core | Draft a single new skill |
| `wip/meta/skill-linter` | core | Validate SKILL.md format |
| `wip/task-router` | core | Route sub-tasks to correct model (local vs cloud) |
| `wip/notify` | core | Telegram alerts — red_gate, checkpoint, report |
| `wip/lifecycle/session-handover` | core | Structured handover doc at context limit |
| `wip/lifecycle/reflect` | core | End-of-session retrospective to LESSONS.md |

### Design
| Skill | Role | What it does |
|---|---|---|
| `wip/screen-builder` | design | Generate screen spec from brief or scope JSON |
| `wip/interactive-proto` | design | Build interactive HTML prototype from storyboard |
| `wip/figma-export` | design | Export assets and tokens from Figma via REST API |
| `wip/design-screen-generator` | design | Storyboard screen list → single HTML proto + per-screen PNG download |
| `wip/rapid-proto` | design | Fast clickable HTML from brief (pre-sale) or storyboard (post-scope) |
| `wip/frontend-polish-pass` | design | Theme audit, spacing pass, MUI+Tailwind conflict check |
| `wip/mui-tailwind-coexistence-guide` | design | MUI v5 + Tailwind coexistence rules; session-start context injection |
| `wip/mermaid-prerender` | design | Pre-render Mermaid to inline SVG for file:// delivery (no CDN/CORS) |
| `wip/diagram-design-editorial` | design | Editorial SVG diagrams (14 types) via cathrynlavery/diagram-design plugin |
| `wip/interactive-diagram` | design | Cytoscape.js interactive diagrams — agent maps, ERDs, screen flows |

### Design / Scope Master sub-skills
| Skill | Role | What it does |
|---|---|---|
| `wip/scope-master/screen-builder` | design-scope-master | Scope Master's screen spec sub-skill |
| `wip/scope-master/interactive-proto` | design-scope-master | Scope Master's interactive proto sub-skill |
| `wip/scope-master/figma-export` | design-scope-master | Scope Master's Figma export sub-skill |
| `wip/scope-master/flow-diagram` | design-scope-master | Generate flow diagrams from scope JSON |

## Code bundles

| Bundle | Description |
|---|---|
| `figma-plugin-nestgenie` | Production Figma plug-in: applies screenshots as fills to Mobile/Desktop frames. Embeds images as base64 via `figma.createImage()` + `figma.setFills()`. No REST calls — fully self-contained. Reference implementation for any Figma import/export plug-in work. |

## Quick start

```
Invoke: agent-setup-wizard  [then select designer-toolkit in the skill picker]
```

## Handoffs to other kits

| When you need... | Kit |
|---|---|
| Full QA pipeline for shipped designs | qa-automation-suite |
| Token cost control on design sessions | efficiency |
