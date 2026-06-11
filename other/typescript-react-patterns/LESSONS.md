# LESSONS: typescript-react-patterns

## 2026-05-08 — tsc --noEmit catches runtime bugs that next build swallows

**Symptom:** `next build` succeeded. Deployed app had a type-related runtime error traceable to a route handler that was returning the wrong shape.

**Cause:** Next.js build process swallows certain TypeScript errors, especially in route handlers (`route.ts`), server actions, and dynamic API routes. The transpiler succeeds; the type error never surfaces until runtime.

**Fix:** Always add `npx tsc --noEmit` as a separate CI step before `npm run build`. These two commands catch different error classes — running both is not redundant.

```yaml
- name: Type check
  run: npx tsc --noEmit

- name: Build
  run: npm run build
```

**Pattern added:** CI type-check section added to SKILL.md as a required step, not optional.

---

## 2026-05-08 — value && <JSX> renders 0 when value is a number

**Symptom:** Book count badge showed `0` in the DOM instead of nothing when a user had no books. User reported it as a UI bug.

**Cause:** `{count && <Badge>{count}</Badge>}` — when `count` is `0`, JavaScript evaluates `0 && ...` as `0`, so React renders the literal number `0` to the DOM.

**Fix:** Always use `!!value` or `value > 0` guard for numeric conditionals in JSX:
```tsx
{count > 0 && <Badge>{count}</Badge>}
// or
{!!count && <Badge>{count}</Badge>}
```

**Pattern added:** Anti-pattern documented in SKILL.md with rule: `value &&` is only safe when typed `boolean | undefined | null`.

---

## 2026-05-08 — Drizzle update payload: use Partial<typeof table.$inferInsert>

**Symptom:** `db.update(users).set(payload)` threw a TypeScript error: "Object literal may only specify known properties." The payload was typed as `Record<string, unknown>`.

**Cause:** Drizzle's `.set()` requires a type that matches the table schema. `Record<string, unknown>` is too wide.

**Fix:** Type update payloads as `Partial<typeof table.$inferInsert>`. This gives the full insert shape with all fields optional — correct for any patch/update operation.

**Pattern added:** Drizzle update payload section in SKILL.md with `$inferInsert` pattern and SQLite vs PG schema import note.
