# FUNCTIONS: context-mode

## Pure functions (Lambda candidates)

None — all processing is inline in the local tool-use loop. No Lambda path exists (context sandboxing is inherently local).

## Deterministic inline functions

| Function | Input | Output | Notes |
|---|---|---|---|
| `apply_filter(lines, pattern)` | list[str], regex | list[str] | Pure filter; no LLM |
| `truncate_output(lines, max_lines, preserve_first_n)` | list[str], int, int | list[str] + overflow_count | Pure slice |
| `inject_overflow_marker(overflow_count)` | int | str | Returns `[... N lines omitted]` |
| `count_lines(text)` | str | int | Pure count |

## AI-assisted steps

| Step | Model | When | Tokens |
|---|---|---|---|
| Overflow summarization | haiku | Only if `summary_model=haiku` set | ~200 tokens per overflow |

## External services / dependencies

| Dep | Install | Notes |
|---|---|---|
| @mksglu/context-mode | `npm install -g @mksglu/context-mode` | 14.8k ⭐, MIT; Node.js >= 18 required |
