import { randomUUID } from "crypto";
import { execute, query } from "../db";

export async function getAllReviewEntriesByUser(userId: string) {
  return query<{ id: string; content: string; period_type: string; period_start: string; created_at: string }>(
    `SELECT id, content, period_type, TO_CHAR(period_start, 'YYYY-MM-DD') as period_start, TO_CHAR(created_at, 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"') as created_at
     FROM review_entries WHERE user_id = :userId ORDER BY period_start DESC, created_at DESC`,
    { userId }
  );
}

export async function getReviewEntriesByUserAndPeriod(userId: string, periodType: string, periodStart: string) {
  return query<{ id: string; content: string; created_at: string }>(
    `SELECT id, content, TO_CHAR(created_at, 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"') as created_at
     FROM review_entries WHERE user_id = :userId AND period_type = :periodType AND period_start = TO_DATE(:periodStart, 'YYYY-MM-DD')
     ORDER BY created_at DESC`,
    { userId, periodType, periodStart }
  );
}

export async function insertReviewEntry(userId: string, data: { content: string; period_type: string; period_start: string }) {
  const id = randomUUID();
  await execute(
    `INSERT INTO review_entries (id, user_id, content, period_type, period_start)
     VALUES (:id, :userId, :content, :periodType, TO_DATE(:periodStart, 'YYYY-MM-DD'))`,
    {
      id,
      userId,
      content: data.content,
      periodType: data.period_type,
      periodStart: data.period_start,
    },
    { autoCommit: true }
  );
  return { id, ...data };
}
