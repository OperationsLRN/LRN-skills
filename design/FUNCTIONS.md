# Functions — designer-toolkit

## Shipped Python scripts

none (kit is all SKILL.md-based; figma-plugin-nestgenie is a JS/HTML code reference)

## AI steps (skills that make LLM calls)

| Skill | Step | Model tier | ~tokens |
|---|---|---|---|
| `screen-builder` | Generate screen spec from brief or scope JSON | Sonnet | ~2k |
| `interactive-proto` | Generate HTML prototype from storyboard | Sonnet | ~3k |
| `design-screen-generator` | Per-screen HTML generation (parallel, Step Functions) | Sonnet | ~2k per screen |
| `rapid-proto` | Generate clickable HTML from brief or storyboard | Sonnet | ~3k |
| `figma-export` | Token extraction + asset description from Figma frames | Sonnet | ~1.5k |
| `frontend-polish-pass` | Theme audit + component pattern analysis | Sonnet | ~2k |
| `diagram-design-editorial` | SVG diagram generation (14 diagram types) | Sonnet | ~2k |
| `interactive-diagram` | Cytoscape.js node/edge spec generation | Sonnet | ~1.5k |
| `scope-master/screen-builder` | Screen spec from scope JSON | Sonnet | ~2k |
| `scope-master/flow-diagram` | Flow diagram from scope JSON | Sonnet | ~1.5k |
| `session-handover` | Structured handover doc synthesis | Sonnet | ~2k |
| `reflect` | Lesson extraction from session (phi4-mini local) | phi4-mini | ~1k |
| `task-router` | Sub-task routing classification | phi4-mini | ~500 |

Token estimates are per single invocation; not yet measured in production.

## External services / deps

| Dep | Purpose | Required? |
|---|---|---|
| Figma REST API | Source for figma-export, design tokens, frame screenshots | Optional (design skills only) |
| Ollama (local) | ug-ug output compression, task routing, reflect | Optional |
| Mermaid CLI (mmdc) | mermaid-prerender — renders Mermaid blocks to inline SVG | Optional |
| Anthropic API | Sonnet calls for spec / prototype generation | Required for cloud AI steps |
| html2canvas (CDN/bundled) | design-screen-generator per-screen PNG download | Optional |
| Cytoscape.js (bundled inline) | interactive-diagram self-contained HTML output | Bundled in output |
