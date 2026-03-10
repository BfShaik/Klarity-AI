import { randomUUID } from "crypto";
import { execute, query, queryOne } from "../db";

export async function getNotesByUser(userId: string, options?: { customerId?: string | null; fromDate?: string; toDate?: string; limit?: number }) {
  const binds: Record<string, unknown> = { userId };
  let where = "user_id = :userId";
  if (options?.customerId) {
    where += " AND customer_id = :customerId";
    binds.customerId = options.customerId;
  } else if (options?.customerId === null) {
    where += " AND customer_id IS NULL";
  }
  if (options?.fromDate && /^\d{4}-\d{2}-\d{2}$/.test(options.fromDate)) {
    where += " AND TRUNC(created_at) >= TO_DATE(:fromDate, 'YYYY-MM-DD')";
    binds.fromDate = options.fromDate;
  }
  if (options?.toDate && /^\d{4}-\d{2}-\d{2}$/.test(options.toDate)) {
    where += " AND TRUNC(created_at) <= TO_DATE(:toDate, 'YYYY-MM-DD')";
    binds.toDate = options.toDate;
  }
  const limitClause = options?.limit ? " FETCH FIRST :limit ROWS ONLY" : "";
  if (options?.limit) binds.limit = options.limit;
  return query<{ id: string; title: string; body: string | null; customer_id: string | null; updated_at: string; created_at: string }>(
    `SELECT id, title, body, customer_id, TO_CHAR(updated_at, 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"') as updated_at, TO_CHAR(created_at, 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"') as created_at
     FROM notes WHERE ${where} ORDER BY updated_at DESC${limitClause}`,
    binds
  );
}

export async function getNoteById(id: string, userId: string) {
  return queryOne<{ id: string; title: string; body: string | null; customer_id: string | null; updated_at: string; source: string }>(
    `SELECT id, title, body, customer_id, TO_CHAR(updated_at, 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"') as updated_at, NVL(source, 'manual') as source FROM notes WHERE id = :id AND user_id = :userId`,
    { id, userId }
  );
}

export async function searchNotes(userId: string, pattern: string, limit = 10) {
  const p = `%${pattern}%`;
  return query<{ id: string; title: string; body: string | null }>(
    `SELECT id, title, body FROM notes WHERE user_id = :userId AND (UPPER(title) LIKE UPPER(:p) OR UPPER(body) LIKE UPPER(:p)) FETCH FIRST :limit ROWS ONLY`,
    { userId, p, limit }
  );
}

export async function insertNote(userId: string, data: { title: string; body?: string | null; customer_id?: string | null }) {
  const id = randomUUID();
  await execute(
    `INSERT INTO notes (id, user_id, title, body, customer_id) VALUES (:id, :userId, :title, :body, :customer_id)`,
    { id, userId, title: data.title.trim(), body: data.body ?? null, customer_id: data.customer_id ?? null },
    { autoCommit: true }
  );
  return { id, ...data };
}

export async function updateNote(id: string, userId: string, data: { title: string; body?: string | null; customer_id?: string | null }) {
  return execute(
    `UPDATE notes SET title = :title, body = :body, customer_id = :customer_id, updated_at = CURRENT_TIMESTAMP WHERE id = :id AND user_id = :userId`,
    { id, userId, title: data.title.trim(), body: data.body ?? null, customer_id: data.customer_id ?? null },
    { autoCommit: true }
  );
}

export async function deleteNote(id: string, userId: string) {
  return execute(`DELETE FROM notes WHERE id = :id AND user_id = :userId`, { id, userId }, { autoCommit: true });
}

export async function countNotes(userId: string) {
  const r = await queryOne<{ cnt: number }>(`SELECT COUNT(*) as cnt FROM notes WHERE user_id = :userId`, { userId });
  return r?.cnt ?? 0;
}
