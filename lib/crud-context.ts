/**
 * CRUD logging and error handling wrapper.
 * Use for every server action and API route that performs create/read/update/delete.
 */

import { logger, generateTraceId } from "@/lib/logger";
import { toUserMessage, getErrorContextForLog } from "@/lib/errors";

export type CrudContext = {
  operation: string;
  resource: string;
  userId?: string;
  traceId?: string;
};

/**
 * Run an async CRUD operation with:
 * - Trace ID for correlation
 * - Start/success/error logging
 * - Normalized user-facing errors (throws Error with safe message)
 */
export async function withCrudLogging<T>(
  context: CrudContext,
  fn: () => Promise<T>
): Promise<T> {
  const traceId = context.traceId ?? generateTraceId();
  const ctx = { ...context, traceId };
  const start = Date.now();

  logger.info(`${context.operation} started`, {
    operation: context.operation,
    resource: context.resource,
    userId: context.userId,
    traceId,
  });

  try {
    const result = await fn();
    const durationMs = Date.now() - start;
    logger.info(`${context.operation} succeeded`, {
      operation: context.operation,
      resource: context.resource,
      userId: context.userId,
      traceId,
      durationMs,
    });
    return result;
  } catch (error) {
    const durationMs = Date.now() - start;
    const errorContext = getErrorContextForLog(error, {
      resource: context.resource,
      operation: context.operation,
    });
    logger.error(`${context.operation} failed`, {
      operation: context.operation,
      resource: context.resource,
      userId: context.userId,
      traceId,
      durationMs,
      error: errorContext,
    });
    throw new Error(toUserMessage(error));
  }
}
