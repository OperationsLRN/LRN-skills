# Paste blocks for designer-toolkit

---

## Block A — First-session orientation

```
I have the designer-toolkit installed. Read in order:

1. ~/.claude/skills/ug-ug/SKILL.md — apply ug-ug immediately
2. The kit's DESIGN-PROMPT-TEMPLATE.md (in the kit folder) — this is the canonical design prompt
3. ~/.claude/skills/screen-builder/SKILL.md
4. ~/.claude/skills/interactive-proto/SKILL.md
5. ~/.claude/skills/rapid-proto/SKILL.md
6. ~/.claude/skills/design-screen-generator/SKILL.md
7. ~/.claude/skills/frontend-polish-pass/SKILL.md
8. ~/.claude/skills/mui-tailwind-coexistence-guide/SKILL.md

Apply ug-ug mode for all internal reasoning:
- Ultra compression for plans (which screens, ordering, decisions)
- Full compression for analysis (debugging spacing, color choices, layout issues)
- Normal prose only when talking to me directly
- Code/HTML/image output: no change, always clean

After reading, give me a 3-bullet summary:
1. Which skill to use for which task (rapid-proto vs interactive-proto vs design-screen-generator)
2. The MUI+Tailwind rule that's most likely to trip me up
3. The first thing you'd recommend I prototype to confirm setup works
```

---

## Block B — Pre-sale fast prototype

```
Client meeting in 2 hours. Need a watermarked clickable HTML prototype for [PROJECT NAME]:

[paste the rough idea / brief]

Use skills/rapid-proto/SKILL.md in pre-sale mode (watermarked). Single self-contained HTML file. 3–5 screens with working navigation between them. Realistic but obviously prototype-grade.

Apply ug-ug to planning; normal output for the HTML.

Output the file path when done.
```

---

## Block C — Post-scope full design pass

```
Storyboard approved. Generating final clickable prototype.

Storyboard path: [path to scope-master/storyboard output]

1. Use skills/design-screen-generator/SKILL.md
2. One HTML file with JS navigation across all screens
3. Per-screen PNG download via html2canvas
4. Apply MUI+Tailwind rules from skills/mui-tailwind-coexistence-guide/SKILL.md
5. Run skills/frontend-polish-pass/SKILL.md at the end before delivery

Apply ug-ug to planning + analysis. HTML output normal.

Save final to G:\AI\output\design-protos\[project]\.
```

---

## Block D — Figma plug-in starter

```
Building a new Figma plug-in for [PURPOSE: e.g. uploading screenshots, exporting components, etc.]

Reference the working plug-in at figma-plugin-nestgenie/ in this kit:
- code.js — production code with figma.createImage() + setFills() pattern
- ui.html — UI panel
- manifest.json — plug-in manifest

1. Read the reference plug-in first
2. Adapt the pattern for [purpose]
3. Keep the same self-contained-no-REST structure if possible
4. Test by importing into Figma desktop → Plugins → Development → Import plugin from manifest

Apply ug-ug to internal reasoning. Code output normal.
```

---

## Block E — Clean handover when context dies

```
About to hit context limit. Clean handover:

1. Invoke skills/session-handover/SKILL.md
2. Write HANDOVER.md with: what's built, files modified, decisions made (especially design system choices), open items, suggested first action
3. If material design decisions were made, update MEMORY-SEED.md style entries in my MEMORY.md
4. Give me a paste block for the next session
5. Flag uncommitted changes; don't auto-commit
```
