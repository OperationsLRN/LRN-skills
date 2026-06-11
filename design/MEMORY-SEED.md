# Memory seed — designer-toolkit

Add these entries to your `~/.claude/projects/<project>/memory/MEMORY.md` so every new chat starts with the design context already loaded.

---

```markdown
- [Designer toolkit installed](kit_designer_toolkit.md) — 25 skills (11 core + 14 design) + NestGenie Figma plug-in reference. Claude Code is primary tool (Cursor is weak at design). Foundation kit — not billable.

- [Design prompt template](kit_designer_prompt_template.md) — DESIGN-PROMPT-TEMPLATE.md in kit folder is the canonical prompt structure. Copy into any new design project's CLAUDE.md for consistent session orientation.

- [MUI + Tailwind coexistence rules](skill_mui_tailwind.md) — Use sx for all spacing (p-/m-/gap- unreliable with CssBaseline). Tailwind group + sx for hover-reveal. Component={NavLink} + &.active in sx. Disable Tailwind preflight when CssBaseline present. Reference: skills/mui-tailwind-coexistence-guide/SKILL.md

- [Mermaid + file:// rule](mermaid_file_delivery.md) — For deliverable HTML opened from disk, always pre-render Mermaid to inline SVG via mermaid-prerender skill. CDN-loaded Mermaid breaks under file:// CORS.

- [Pre-sale vs post-scope proto modes](skill_rapid_proto_modes.md) — rapid-proto pre-sale: watermarked, time-boxed (1–2h), single self-contained HTML. design-screen-generator post-scope: storyboard input, per-screen PNG export, no watermark.

- [Ug-ug mode active for design](feedback_ug-ug_design.md) — Ultra for plans (screen lists, ordering). Full for analysis (spacing, color, debug). Normal prose only when talking to user. HTML/image/code output unchanged.

- [Figma plug-in reference](kit_figma_plugin_ref.md) — figma-plugin-nestgenie/ in the kit is production code: manifest.json + ui.html + code.js with figma.createImage() + setFills() pattern. Use as starter for any new Figma plug-in. Self-contained desktop plug-in, no REST.
```

---

## Detail files (optional)

Most of the entries above are one-liners that are sufficient as-is. Two exceptions worth detail files:

### `skill_mui_tailwind.md` — full coexistence rules

```markdown
# MUI v5 + Tailwind Coexistence

**The 4 rules that prevent 90% of conflicts:**

1. **Spacing:** Use MUI sx for ALL p-/m-/gap-. Tailwind utility classes are unreliable with CssBaseline because Material UI's reset eats them.
2. **Hover-reveal:** Tailwind `group` + MUI `sx` is the working combo. Don't try pure Tailwind hover; the parent group needs to be a Tailwind div for `group-hover:` to fire.
3. **Active link styling:** `<Button component={NavLink} ...>` and put `&.active` styles in `sx`. NOT className-based active styling.
4. **Tailwind preflight:** Disable preflight when CssBaseline is present. They both reset; running both produces compounded resets and weird font sizes.

Full reference: `skills/mui-tailwind-coexistence-guide/SKILL.md`
```

### `skill_rapid_proto_modes.md` — pre-sale vs post-scope

```markdown
# rapid-proto modes

**Pre-sale (watermarked):**
- Input: rough brief (no storyboard required)
- Time: 1–2 hours target
- Output: single self-contained HTML file
- Watermark: visible "PROTOTYPE — NOT FOR PRODUCTION" overlay
- Screen count: 3–5 typically
- Used for: client meetings, sales demos, fast iteration on concept

**Post-scope (full delivery):**
- Input: approved storyboard (scope-master output)
- Time: 4–8 hours
- Output: HTML + per-screen PNG via html2canvas
- No watermark
- Screen count: matches storyboard exactly
- Used for: design delivery, developer handoff

Delegates: rapid-proto post-scope mode → design-screen-generator if storyboard is structured.

Reference: `skills/rapid-proto/SKILL.md` + `skills/design-screen-generator/SKILL.md`
```

---

## After install

Open your `MEMORY.md` and add the entries above. The detail files are optional — create them only if you reference the patterns frequently enough that one-line summaries don't cut it.
