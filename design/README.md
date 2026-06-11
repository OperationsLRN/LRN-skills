# designer-toolkit — v1.0.0

**Audience:** Designer (Travis or any designer working in Claude Code)
**Built:** 2026-05-11
**Skills included:** 25 (11 core + 14 design)
**Code reference included:** NestGenie Figma plug-in (production)
**Billable scope:** Foundation kit — not billable

---

## What this is

The full design-phase toolkit: screen specs, interactive HTML prototypes, Figma import/export, flow diagrams, theme audits, MUI+Tailwind coexistence rules, mermaid + cytoscape diagrams, and a canonical design-prompt template for driving Claude on design work.

Bundled with a **working Figma plug-in** (NestGenie Raster Uploader) as a reference for any future Figma tooling — you can clone its pattern for new plug-ins.

**Target tool:** Claude Code primary. Cursor is weak at design tasks per workspace policy. Codex acceptable for code-focused design work.

---

## What's inside

### Core foundation (11 skills — always install)

ug-ug, memory-ladder, agent-setup-wizard, project-env-setup, skillmaster, skill-builder, skill-linter, task-router, notify, session-handover, reflect

### Design skills (10 standalone + 4 scope-master variants)

| Skill | What it does |
|---|---|
| `screen-builder` | Standalone screen spec builder |
| `interactive-proto` | HTML clickable prototype |
| `figma-export` | Pull assets from Figma |
| `design-screen-generator` | Storyboard screen list → HTML proto + per-screen PNG |
| `rapid-proto` | Fast clickable HTML (pre-sale or post-scope modes) |
| `frontend-polish-pass` | Theme + spacing + MUI/Tailwind conflict audit |
| `mui-tailwind-coexistence-guide` | MUI v5 + Tailwind rules + session-start injection |
| `mermaid-prerender` | Pre-render Mermaid to inline SVG (file:// safe) |
| `diagram-design-editorial` | Editorial SVG diagrams (14 types) |
| `interactive-diagram` | Cytoscape.js interactive diagrams |
| `scope-master/screen-builder` | Scope Master sub-skill variant |
| `scope-master/interactive-proto` | Scope Master sub-skill variant |
| `scope-master/figma-export` | Scope Master sub-skill variant |
| `scope-master/flow-diagram` | Flow diagram generator from scope |

### Figma plug-in (code reference)

`figma-plugin-nestgenie/` — production Figma plug-in (NestGenie Raster Uploader). Self-contained desktop plug-in that applies 29 screenshot JPGs as fills to Mobile Light + Desktop Light frames without REST calls. Use this as the reference for any new Figma import/export plug-in you build.

---

## Quick install

```bash
unzip designer-toolkit-v1.0.0.zip
cd designer-toolkit

# Install skills into Claude Code
cp -r skills/* ~/.claude/skills/

# Read the design prompt template
cat DESIGN-PROMPT-TEMPLATE.md
```

Open Claude Code, paste **Block A** from `PASTE-BLOCK-FOR-CLAUDE.md`.

---

## What you bill on

Nothing — this is foundation infrastructure. Bill on the client design work you deliver (storyboards, prototypes, Figma files, polished UIs), not on the skills themselves.

---

## "Claude Design" note

There is no product called "Claude Design" in this workspace. The phrase refers informally to "Claude Code applied to design tasks." This kit IS that — skills + paste blocks + a code reference, all targeting Claude Code as the primary tool.

---

## Files to read first

1. `START_HERE.md` — install + reading order
2. `DESIGN-PROMPT-TEMPLATE.md` — the canonical prompt for design tasks
3. `PASTE-BLOCK-FOR-CLAUDE.md` — paste blocks for AI sessions
4. `MEMORY-SEED.md` — memory entries to add to MEMORY.md
5. `figma-plugin-nestgenie/README.md` — the plug-in's own docs
