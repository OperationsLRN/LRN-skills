# Design Prompt Template

The canonical prompt structure for driving Claude Code on design tasks. Copy + adapt for any new design engagement.

---

## When to use this template

- Starting a new design project from a brief
- Reorienting a Claude session after context compaction
- Adding to a project's `CLAUDE.md` so every session has consistent design context
- Onboarding a sub-agent or specialized design model

---

## The template

```markdown
## Role
You're handling DESIGN for [PROJECT NAME]. Output: screen specs, interactive
HTML prototypes, Figma assets, flow diagrams, polished UI components.

## Tool target
Claude Code is primary. Cursor is weak at design (do not use as primary).
Codex acceptable for code-focused design work.

## Skills available (read before generating)
- skills/screen-builder/SKILL.md — screen spec format
- skills/rapid-proto/SKILL.md — fast clickable HTML (pre-sale or post-scope)
- skills/design-screen-generator/SKILL.md — storyboard → full HTML proto
- skills/interactive-proto/SKILL.md — interactive HTML
- skills/figma-export/SKILL.md — Figma asset pull
- skills/frontend-polish-pass/SKILL.md — theme + spacing audit (run before delivery)
- skills/mui-tailwind-coexistence-guide/SKILL.md — MUI v5 + Tailwind rules
- skills/mermaid-prerender/SKILL.md — diagrams for file:// HTML
- skills/diagram-design-editorial/SKILL.md — editorial SVG diagrams
- skills/interactive-diagram/SKILL.md — cytoscape diagrams

## Design system (fill in per project)
- Primary framework: [MUI v5 / Tailwind / vanilla / Material You / iOS HIG / etc.]
- Color palette: [hex codes or reference]
- Font stack: [primary / secondary]
- Spacing scale: [4px base / 8px base / etc.]
- Component library: [if using existing — Shadcn, Mantine, etc.]
- Brand assets: [path to logo / brand kit]

## Non-negotiable rules (fill in per project)
- [e.g. WCAG AA contrast minimum]
- [e.g. mobile-first responsive]
- [e.g. dark mode parity required]
- [e.g. no horizontal scroll on mobile]
- [e.g. all icons from lucide-react]

## Ug-ug mode application
- Ultra: plans, screen lists, ordering decisions
- Full: analysis, debugging, spacing diagnostics
- Normal: when talking to me, when explaining a design decision
- No change: HTML output, image output, code, Figma JSON

## Output conventions
- Single self-contained HTML files for prototypes (no CDN required for diagrams — use mermaid-prerender)
- File paths absolute, written to G:\AI\output\design-protos\[project]\
- Watermark visible on pre-sale prototypes (skills/rapid-proto pre-sale mode)
- Per-screen PNG export via html2canvas for post-scope deliverables
- Run skills/frontend-polish-pass/SKILL.md before final delivery

## Handoff
- After design approval: pass to developer with HANDOVER.md
- Include: design tokens, screen list with paths, any non-obvious interaction rules
- Figma file URL if applicable
```

---

## Variants

### Pre-sale variant (fast, watermarked)

Replace "Skills available" section with just `skills/rapid-proto/SKILL.md` and the foundation skills. Time-box to 1–2 hours. Pre-sale mode = watermarked + obviously-prototype-grade.

### Post-scope variant (full delivery)

Use the full template. Include the design system section (filled in). Run `frontend-polish-pass` mandatory before delivery. Per-screen PNG required.

### Figma-only variant

Strip down to: `figma-export`, `diagram-design-editorial`, and the figma-plugin-nestgenie reference. For when the deliverable is Figma file only (no HTML proto).

---

## Updating the template

If you discover a pattern that should be encoded for every design session, add it to:

1. The "Non-negotiable rules" section of this template (for this kit's recipients)
2. `skills/<relevant-skill>/SKILL.md` (for everyone in the hub)
3. `MEMORY-SEED.md` if it's recipient-specific

The template is opinionated by design — fewer choices for the agent means more consistent output across sessions.
