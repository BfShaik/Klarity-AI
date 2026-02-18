/**
 * Centralized structured logger. Use across the app for consistency.
 * In development: human-readable; in production: JSON for log aggregation.
 * Writes errors and warnings to logs/error.log for debugging.
 */

import { appendFile, mkdir } from "fs/promises";
import { join } from "path";

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
const LOG_DIR = join(process.cwd(), "logs");

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

async function writeToLogFile(out: string): Promise<void> {
  try {
    await mkdir(LOG_DIR, { recursive: true });
    await appendFile(join(LOG_DIR, "error.log"), out + "\n");
  } catch {
    // Ignore file write failures (e.g. permissions, disk full)
  }
}

function log(level: LogLevel, message: string, context?: LogContext): void {
  const out = formatMessage(level, message, context);
  switch (level) {
    case "error":
      console.error(out);
      writeToLogFile(out);
      break;
    case "warn":
      console.warn(out);
      writeToLogFile(out);
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
