import { randomUUID } from "crypto";
import { execute, query, queryOne } from "../db";

export async function insertWorkLog(data: {
  user_id: string;
  date: string;
  summary: string;
  minutes?: number | null;
  customer_id?: string | null;
}) {
  const id = randomUUID();
  await execute(
    `INSERT INTO work_logs (id, user_id, log_date, summary, minutes, customer_id)
     VALUES (:id, :user_id, TO_DATE(:dateVal, 'YYYY-MM-DD'), :summary, :minutes, :customer_id)`,
    {
      id,
      user_id: data.user_id,
      dateVal: data.date,
      summary: data.summary,
      minutes: data.minutes ?? null,
      customer_id: data.customer_id ?? null,
    },
    { autoCommit: true }
  );
  return { id, ...data };
}

export async function getWorkLogsByUser(userId: string, options?: { limit?: number; order?: "asc" | "desc"; from?: string; to?: string }) {
  const order = options?.order === "asc" ? "ASC" : "DESC";
  const limit = options?.limit ?? 100;
  const binds: Record<string, unknown> = { userId, limit };
  let where = "user_id = :userId";
  if (options?.from && /^\d{4}-\d{2}-\d{2}$/.test(options.from)) {
    where += " AND log_date >= TO_DATE(:fromDate, 'YYYY-MM-DD')";
    binds.fromDate = options.from;
  }
  if (options?.to && /^\d{4}-\d{2}-\d{2}$/.test(options.to)) {
    where += " AND log_date <= TO_DATE(:toDate, 'YYYY-MM-DD')";
    binds.toDate = options.to;
  }
  return query<{ id: string; date: string; summary: string; minutes: number | null; customer_id: string | null }>(
    `SELECT id, TO_CHAR(log_date, 'YYYY-MM-DD') as "date", summary, minutes, customer_id
     FROM work_logs WHERE ${where} ORDER BY log_date ${order} FETCH FIRST :limit ROWS ONLY`,
    binds
  );
}

export async function updateWorkLog(
  id: string,
  userId: string,
  data: { date: string; summary: string; minutes?: number | null; customer_id?: string | null }
) {
  return execute(
    `UPDATE work_logs SET log_date = TO_DATE(:dateVal, 'YYYY-MM-DD'), summary = :summary, minutes = :minutes, customer_id = :customer_id, updated_at = CURRENT_TIMESTAMP
     WHERE id = :id AND user_id = :userId`,
    {
      id,
      userId,
      dateVal: data.date,
      summary: data.summary,
      minutes: data.minutes ?? null,
      customer_id: data.customer_id ?? null,
    },
    { autoCommit: true }
  );
}

export async function deleteWorkLog(id: string, userId: string) {
  return execute(
    `DELETE FROM work_logs WHERE id = :id AND user_id = :userId`,
    { id, userId },
    { autoCommit: true }
  );
}

export async function countWorkLogs(userId: string) {
  const r = await queryOne<{ cnt: number }>(
    `SELECT COUNT(*) as cnt FROM work_logs WHERE user_id = :userId`,
    { userId }
  );
  return r?.cnt ?? 0;
}

export async function searchWorkLogs(userId: string, pattern: string, limit = 5) {
  const p = `%${pattern}%`;
  return query<{ id: string; date: string; summary: string }>(
    `SELECT id, TO_CHAR(log_date, 'YYYY-MM-DD') as "date", summary
     FROM work_logs WHERE user_id = :userId AND UPPER(summary) LIKE UPPER(:p)
     FETCH FIRST :limit ROWS ONLY`,
    { userId, p, limit }
  );
}

export async function getWorkLogDatesInRange(userId: string, startDate: string, endDate: string) {
  return query<{ log_date: string }>(
    `SELECT TO_CHAR(log_date, 'YYYY-MM-DD') as log_date FROM work_logs
     WHERE user_id = :userId AND log_date >= TO_DATE(:startDate, 'YYYY-MM-DD') AND log_date <= TO_DATE(:endDate, 'YYYY-MM-DD')`,
    { userId, startDate, endDate }
  );
}

export async function getWorkLogsInDateRange(
  userId: string,
  startDate: string,
  endDate: string
) {
  return query<{ date: string }>(
    `SELECT TO_CHAR(log_date, 'YYYY-MM-DD') as "date" FROM work_logs
     WHERE user_id = :userId AND log_date >= TO_DATE(:startDate, 'YYYY-MM-DD') AND log_date <= TO_DATE(:endDate, 'YYYY-MM-DD')`,
    { userId, startDate, endDate }
  );
}
