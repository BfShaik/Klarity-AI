/**
 * Centralized structured logger. Use across the app for consistency.
 * In development: human-readable; in production: JSON for log aggregation.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogContext = {
  operation?: string;
  resource?: string;
  userId?: string;
  traceId?: string;
  durationMs?: number;
  [key: string]: unknown;
};

const isDev = process.env.NODE_ENV !== "production";

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  if (isDev) {
    const ctx = context ? ` ${JSON.stringify(context)}` : "";
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${ctx}`;
  }
  return JSON.stringify({
    timestamp,
    level,
    message,
    ...context,
  });
}

function log(level: LogLevel, message: string, context?: LogContext): void {
  const out = formatMessage(level, message, context);
  switch (level) {
    case "error":
      console.error(out);
      break;
    case "warn":
      console.warn(out);
      break;
    case "debug":
      if (isDev) console.debug(out);
      break;
    default:
      console.log(out);
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => log("debug", message, context),
  info: (message: string, context?: LogContext) => log("info", message, context),
  warn: (message: string, context?: LogContext) => log("warn", message, context),
  error: (message: string, context?: LogContext) => log("error", message, context),
};

/** Generate a short trace id for correlating logs within a request/operation. */
export function generateTraceId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
