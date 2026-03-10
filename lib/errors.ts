/**
 * Centralized error handling: normalize errors and produce user-facing messages.
 * Reused across all CRUD operations and API routes.
 */

export type ErrorContextForLog = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
  resource?: string;
  operation?: string;
};

/** Supabase/PostgREST style error shape. */
type SupabaseLikeError = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

function isSupabaseLikeError(e: unknown): e is SupabaseLikeError {
  return (
    typeof e === "object" &&
    e !== null &&
    "message" in e &&
    (typeof (e as SupabaseLikeError).code === "string" || (e as SupabaseLikeError).code === undefined)
  );
}

/** Message shown when backend/Supabase is unreachable. */
export const SERVICE_UNAVAILABLE_MESSAGE =
  "We're having an internal issue. We're working to fix it — please check back later.";

const CONNECTION_PATTERNS = [
  "fetch failed", "network", "econnrefused", "etimedout", "enotfound",
  "connection refused", "connection reset", "failed to fetch", "load failed",
  "network error", "unable to connect", "service unavailable", "503", "getaddrinfo",
];

function isConnectionOrServiceError(error: unknown): boolean {
  let text = "";
  if (error instanceof Error) {
    text = (error.message + " " + (error.cause ? String(error.cause) : "")).toLowerCase();
  } else if (typeof error === "object" && error !== null && "message" in error) {
    text = String((error as { message: unknown }).message).toLowerCase();
  }
  return CONNECTION_PATTERNS.some((p) => text.includes(p));
}

/** Map known DB/API error codes to user-friendly messages. */
const USER_MESSAGES: Record<string, string> = {
  "23503":
    "A linked record is missing. If you just signed up, sign out and sign in again, or run the profile backfill in Supabase (see schema.sql).",
  "23505": "This record already exists (duplicate).",
  "23502": "Required data is missing.",
  "23514": "A value is not allowed for this field.",
  "42501": "You don’t have permission to do this.",
  "PGRST116": "The requested record was not found.",
  "invalid_login_credentials": "Invalid email or password. Please check your credentials and try again.",
  "email_not_confirmed": "Please confirm your email address. Check your inbox for the verification link.",
};

/**
 * Get a safe, user-facing message. Never expose internal details.
 */
export function toUserMessage(error: unknown): string {
  if (isConnectionOrServiceError(error)) {
    return SERVICE_UNAVAILABLE_MESSAGE;
  }
  if (isSupabaseLikeError(error)) {
    const code = (error as { code?: string }).code ?? "";
    const custom = USER_MESSAGES[code];
    if (custom) return custom;
    const msg = error.message && typeof error.message === "string" ? error.message : "";
    if (msg.toLowerCase().includes("invalid login credentials")) return USER_MESSAGES["invalid_login_credentials"];
    if (msg.toLowerCase().includes("email not confirmed")) return USER_MESSAGES["email_not_confirmed"];
    if (msg.length > 200) return "Something went wrong. Please try again.";
    if (msg) return msg;
  }
  if (error instanceof Error) {
    return error.message || "Something went wrong. Please try again.";
  }
  if (typeof error === "object" && error !== null && "message" in error) {
    const msg = (error as { message: unknown }).message;
    if (typeof msg === "string") return msg;
  }
  return "Something went wrong. Please try again.";
}

/**
 * Extract context for logging only. Do not send to the client.
 */
export function getErrorContextForLog(error: unknown, extra?: { resource?: string; operation?: string }): ErrorContextForLog {
  const ctx: ErrorContextForLog = { ...extra };
  if (isSupabaseLikeError(error)) {
    ctx.code = error.code;
    ctx.message = error.message;
    ctx.details = error.details;
    ctx.hint = error.hint;
  } else if (error instanceof Error) {
    ctx.message = error.message;
    ctx.code = undefined;
  }
  return ctx;
}
