# SKILL: context-mode

**Bot:** any · developer · operator
**Role:** Sandboxes tool outputs so only relevant results reach the model's context window — prevents file dumps, noisy stdout, and oversized tool responses from filling context. Works as a filtering layer in the Claude Code tool-use loop.
**Ug-ug mode:** full
**Model:** haiku — deterministic filtering; no reasoning required
**Tool compatibility:** Claude Code · Cursor
**Status:** beta  <!-- v2-backfill 2026-05-31: auto-inferred — verify before ready/ promotion -->
**Parallelizable:** yes — no shared mutable state detected (auto-inferred; verify)
**Origin:** mksglu/context-mode (14.8k ⭐, MIT)

---

## When to invoke

**Trigger phrases:**
- "context is getting full from tool outputs"
- "file read is flooding the context"
- "only show me the relevant parts"
- "wrap this tool in context-mode"
- "filter tool output before injecting"
- "enable context-mode"

**Conditions:**
- Any `Read` / `Bash` / `Grep` call expected to return > 200 lines
- Running in a long session where tool noise is accumulating
- Before any multi-file reasoning pass where full file content is not needed

**Do NOT invoke for:**
- Single-file reads where the full file IS the task (e.g. reading a config)
- Tool outputs < 50 lines
- Debug sessions where full stdout is needed

---

## Inputs

| Parameter | Type | Default | Notes |
|---|---|---|---|
| `tool_call` | tool name + args | required | The tool invocation to sandbox |
| `max_lines` | int | 50 | Max lines of output to pass through |
| `filter_pattern` | regex \| null | null | Only pass lines matching this pattern |
| `summary_model` | `haiku` \| `none` | `none` | If set, summarize overflow into 1–3 sentences |
| `preserve_first_n` | int | 10 | Always keep first N lines (imports, headers) |

---

## Steps

### Step 1 — Install context-mode
```bash
npm install -g @mksglu/context-mode
# or: npx @mksglu/context-mode
```

### Step 2 — Wire into Claude Code `.mcp.json`
```json
{
  "mcpServers": {
    "context-mode": {
      "command": "npx",
      "args": ["-y", "@mksglu/context-mode"],
      "env": {
        "CONTEXT_MODE_MAX_LINES": "50",
        "CONTEXT_MODE_SUMMARIZE": "false"
      }
    }
  }
}
```

Place `.mcp.json` in the project root or `~/.claude/` for global effect.

### Step 3 — Manual invocation pattern

When a tool call is expected to flood context, wrap it:

```
[Before issuing the tool call, route through context-mode]

context-mode tool=Read args={file: "large_file.ts"} max_lines=80 filter_pattern="export|function|class|interface"
```

context-mode intercepts the output, applies the filter, truncates at `max_lines`, and injects a `[... N lines omitted ...]` marker for overflows.

### Step 4 — Summary mode (when haiku summarization enabled)
If `summary_model=haiku`:
- Lines 1–`preserve_first_n` pass through verbatim
- Overflow lines are fed to haiku with prompt: `"Summarize this tool output in 2 sentences focusing on: errors, file count, key values"`
- Summary replaces the overflow block in context

### Step 5 — Session-level enable (Claude Code setting)
Add to project `CLAUDE.md`:
```markdown
## Tool output sandboxing
Always route tool outputs > 100 lines through context-mode.
Max lines per tool call: 80.
Filter patterns: errors, exports, function signatures, class definitions.
```

---

## Output spec

| Output | Format | Notes |
|---|---|---|
| Filtered tool output | same as original tool | Truncated at `max_lines` |
| Overflow marker | `[... N lines omitted — use filter_pattern to narrow]` | Injected at truncation point |
| Summary (if enabled) | 1–3 sentence prose | Replaces overflow in context |

---

## Lambda candidates

None — this skill hooks into local tool execution flow and cannot run remotely.

---

## Handoffs

| Next skill | When | Path |
|---|---|---|
| `token-compressor` | If filter alone isn't enough, compress what passes through | `G:\AI\skills\wip\compress\command\SKILL.md` |
| `token-savior-mcp` | Complementary MCP — strips redundant context at request level | `G:\AI\skills\wip\developer\token-savior-mcp\SKILL.md` |
| `codebase-memory-mcp` | For codebase navigation, use semantic index instead of file reads | `G:\AI\skills\wip\codebase-memory-mcp\SKILL.md` |
| `session-handover` | If context is already full — trigger handover | `G:\AI\skills\wip\lifecycle\session-handover\SKILL.md` |

## Permissions

<!-- v2-backfill 2026-05-31: auto-inferred — verify before ready/ promotion -->

| Type | Pattern | Why |
|---|---|---|
| Bash | `npm *` | Referenced in skill body |
| Filesystem | `G:\AI\*` | Referenced in skill body |
