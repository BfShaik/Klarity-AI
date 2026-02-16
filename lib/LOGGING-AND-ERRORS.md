# Logging, Tracing & Error Monitoring

A shared framework used across the app for every CRUD operation and API route.

## Layout

| File | Role |
|------|------|
| `lib/logger.ts` | Structured logging (info, warn, error, debug) and trace IDs |
| `lib/errors.ts` | Normalize errors and safe user-facing messages |
| `lib/crud-context.ts` | Wrapper that runs CRUD with logging + error handling |

## Usage

### Server actions (create/update/delete)

Use `withCrudLogging` so each operation is logged and errors are turned into safe messages:

```ts
import { withCrudLogging } from "@/lib/crud-context";

export async function createSomething(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in.");

  return withCrudLogging(
    { operation: "createSomething", resource: "something", userId: user.id },
    async () => {
      // ... validate, insert, revalidatePath
    }
  );
}
```

- **Logs:** `"createSomething started"` and either `"createSomething succeeded"` (with `durationMs`) or `"createSomething failed"` (with error context).
- **Errors:** Throws a single `Error` with a user-safe message (no raw DB/API details).

### API routes

Use `logger` and `toUserMessage` / `getErrorContextForLog` in try/catch:

```ts
import { logger } from "@/lib/logger";
import { toUserMessage, getErrorContextForLog } from "@/lib/errors";

export async function POST(request: Request) {
  const start = Date.now();
  let userId: string | undefined;
  try {
    // ... auth, userId = user.id
    logger.info("Operation started", { operation: "opName", resource: "resourceName", userId });
    // ... do work
    logger.info("Operation succeeded", { operation: "opName", resource: "resourceName", userId, durationMs: Date.now() - start });
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error("Operation failed", { operation: "opName", resource: "resourceName", userId, durationMs: Date.now() - start, error: getErrorContextForLog(error) });
    return NextResponse.json({ error: toUserMessage(error) }, { status: 500 });
  }
}
```

### Direct logger / errors

- **Logger:** `logger.info("message", { operation, resource, userId, traceId, durationMs })`
- **User message:** `toUserMessage(error)` — never send raw errors to the client.
- **Log-only context:** `getErrorContextForLog(error, { resource, operation })` — for `logger.error(..., { error: getErrorContextForLog(error) })`.

## Error codes (Postgres/Supabase)

`lib/errors.ts` maps common codes to short, safe messages:

- `23503` — Foreign key violation (e.g. missing profile)
- `23505` — Duplicate
- `23502` — Required missing
- `23514` — Check constraint
- `42501` — Permission
- `PGRST116` — Not found

Add new codes in `USER_MESSAGES` and keep text user-friendly.

## Trace IDs

- `generateTraceId()` in `lib/logger.ts` produces a short unique id.
- Pass `traceId` in context so you can correlate logs for one request/operation.

## Where it’s used

- **Server actions:** customers, goals, learning, certifications, badges, notes (create).
- **API routes:** planner, work-logs, ai, search, transcribe.

All CRUD and these APIs go through the same logging and error handling.
