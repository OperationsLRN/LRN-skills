# SKILL: typescript-react-patterns

**Bot:** developer · any
**Role:** TypeScript + React gotcha reference — unknown type guards, Drizzle update patterns, common anti-patterns that cause silent bugs
**Ug-ug mode:** lite
**Model:** haiku — rule lookup and pattern application
**Tool compatibility:** Claude Code · Cursor · Codex
**Status:** beta  <!-- v2-backfill 2026-05-31: auto-inferred — verify before ready/ promotion -->
**Parallelizable:** yes — no shared mutable state detected (auto-inferred; verify)

**Tags:** typescript, react, drizzle, type-safety, patterns, anti-patterns

---

## When to invoke

- "TypeScript error I don't understand"
- "Why does `value && <Component />` cause a render bug?"
- "How do I type a Drizzle update payload?"
- "unknown type guard pattern"
- Any TS error involving `unknown`, `never`, or Drizzle inferred types
- Inject as context at the start of any TypeScript + React + Drizzle session

---

## Anti-pattern: `unknown && <JSX>`

**❌ Bug — renders `0` or `false` when value is falsy:**
```tsx
// If value is 0, this renders the number 0 to the DOM
{value && <Component />}

// If value is type unknown, TypeScript may not catch this
{someUnknownValue && <Component />}
```

**✅ Correct — always use `!!` for unknown/any type guards:**
```tsx
{!!value && <Component />}

// Or explicit boolean cast:
{Boolean(value) && <Component />}

// Or ternary for clarity:
{value ? <Component /> : null}
```

**Rule:** When the type is `unknown`, `any`, `number`, or a union that includes falsy primitives — use `!!value` not `value` for JSX conditional rendering. `value &&` is only safe when `value` is typed as `boolean | undefined | null`.

---

## Drizzle update payload typing

**❌ Problem — `db.update().set(payload)` where payload has extra fields:**
```typescript
// This throws: Object literal may only specify known properties
const payload = { name: 'Taylor', unknownField: 'x' }
await db.update(users).set(payload)  // TS error
```

**✅ Pattern — `Partial<typeof table.$inferInsert>`:**
```typescript
import { users } from './schema'

type UserPatch = Partial<typeof users.$inferInsert>

async function updateUser(id: string, patch: UserPatch) {
  await db.update(users)
    .set(patch)
    .where(eq(users.id, id))
}
```

`$inferInsert` gives you the full insert shape. `Partial<>` makes all fields optional. This is the correct type for any "patch update" operation in Drizzle.

**For Postgres vs SQLite schemas:**
```typescript
// Use the schema that matches your runtime DB
import { users } from './schema.pg'       // production
import { users } from './schema.sqlite'   // dev
```

---

## Type narrowing for `unknown`

```typescript
// Pattern: narrow unknown before use
function processValue(value: unknown) {
  // ❌ value.name  — TS error: Object is of type 'unknown'

  // ✅ Type guard
  if (typeof value === 'string') {
    return value.toUpperCase()
  }

  // ✅ Type assertion (only when you're certain)
  const typed = value as { name: string }
  return typed.name

  // ✅ Zod parse (safest)
  const result = MySchema.safeParse(value)
  if (result.success) return result.data.name
}
```

---

## Common React + TS patterns

### Optional chaining in JSX
```tsx
// ❌ Unsafe
{user.profile.avatar}

// ✅ Safe
{user?.profile?.avatar ?? <DefaultAvatar />}
```

### Event handler typing
```tsx
// ❌ Implicit any
const handleChange = (e) => { ... }

// ✅ Explicit
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value)
}
```

### Async in useEffect
```tsx
// ❌ useEffect(async () => ...) — returns a promise, breaks cleanup
useEffect(async () => { await fetchData() }, [])

// ✅ Inner async function
useEffect(() => {
  const run = async () => { await fetchData() }
  run()
}, [])
```

### Discriminated union for component variants
```typescript
type ButtonProps =
  | { variant: 'primary'; onClick: () => void }
  | { variant: 'link'; href: string }

// TypeScript enforces correct props per variant
```

---

## CI type-check (always include)

`next build` swallows some TypeScript errors. Always add `tsc --noEmit` as a separate CI step:

```yaml
- name: Type check
  run: npx tsc --noEmit

- name: Build
  run: npm run build
```

These catch different error classes. Running both is not redundant.

---

## Lambda / Step Functions candidates

None — reference skill applied during LLM sessions.

---

## Handoffs

- **→ `drizzle-schema-drift`** (`G:\AI\skills\wip\drizzle-schema-drift\SKILL.md`) — if Drizzle type errors are schema-related
- **→ `mui-tailwind-coexistence-guide`** (`G:\AI\skills\wip\mui-tailwind-coexistence-guide\SKILL.md`) — if errors are in MUI+Tailwind component code
- **→ `frontend-polish-pass`** (`G:\AI\skills\wip\frontend-polish-pass\SKILL.md`) — after fixing TS errors, run a polish pass

## Permissions

<!-- v2-backfill 2026-05-31: auto-inferred — verify before ready/ promotion -->

| Type | Pattern | Why |
|---|---|---|
| Filesystem | `G:\AI\*` | Referenced in skill body |
