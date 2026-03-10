import { randomUUID } from "crypto";
import { execute, query, queryOne } from "../db";

export async function getGoalsByUser(userId: string, options?: { status?: string }) {
  const binds: Record<string, unknown> = { userId };
  let where = "user_id = :userId";
  if (options?.status) {
    where += " AND status = :status";
    binds.status = options.status;
  }
  return query<{
    id: string;
    title: string;
    target_date: string | null;
    linked_certification_id: string | null;
    status: string;
    completed_at: string | null;
  }>(
    `SELECT id, title, TO_CHAR(target_date, 'YYYY-MM-DD') as target_date, linked_certification_id, status,
            TO_CHAR(completed_at, 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"') as completed_at
     FROM goals WHERE ${where} ORDER BY target_date NULLS LAST`,
    binds
  );
}

export async function insertGoal(userId: string, data: {
  title: string;
  target_date?: string | null;
  linked_certification_id?: string | null;
  status?: string;
}) {
  const id = randomUUID();
  await execute(
    `INSERT INTO goals (id, user_id, title, target_date, linked_certification_id, status)
     VALUES (:id, :userId, :title, CASE WHEN :targetDate IS NOT NULL THEN TO_DATE(:targetDate, 'YYYY-MM-DD') ELSE NULL END, :linkedCertId, :status)`,
    {
      id,
      userId,
      title: data.title.trim(),
      targetDate: data.target_date ?? null,
      linkedCertId: data.linked_certification_id ?? null,
      status: data.status ?? "active",
    },
    { autoCommit: true }
  );
  return { id, ...data };
}

export async function updateGoal(id: string, userId: string, data: {
  title?: string;
  target_date?: string | null;
  linked_certification_id?: string | null;
  status?: string;
  completed_at?: string | null;
}) {
  const sets: string[] = [];
  const binds: Record<string, unknown> = { id, userId };
  if (data.title !== undefined) {
    sets.push("title = :title");
    binds.title = data.title.trim();
  }
  if (data.target_date !== undefined) {
    sets.push("target_date = CASE WHEN :targetDate IS NOT NULL THEN TO_DATE(:targetDate, 'YYYY-MM-DD') ELSE NULL END");
    binds.targetDate = data.target_date;
  }
  if (data.linked_certification_id !== undefined) {
    sets.push("linked_certification_id = :linkedCertId");
    binds.linkedCertId = data.linked_certification_id;
  }
  if (data.status !== undefined) {
    sets.push("status = :status");
    binds.status = data.status;
  }
  if (data.completed_at !== undefined) {
    sets.push("completed_at = CASE WHEN :completedAt IS NOT NULL THEN TO_TIMESTAMP_TZ(:completedAt, 'YYYY-MM-DD\"T\"HH24:MI:SS.FF3\"Z\"') ELSE NULL END");
    binds.completedAt = data.completed_at;
  }
  if (sets.length === 0) return 0;
  sets.push("updated_at = CURRENT_TIMESTAMP");
  return execute(`UPDATE goals SET ${sets.join(", ")} WHERE id = :id AND user_id = :userId`, binds, { autoCommit: true });
}

export async function deleteGoal(id: string, userId: string) {
  return execute(`DELETE FROM goals WHERE id = :id AND user_id = :userId`, { id, userId }, { autoCommit: true });
}

export async function getUpcomingGoals(userId: string, limit = 5) {
  return query<{ id: string; title: string; target_date: string | null }>(
    `SELECT id, title, TO_CHAR(target_date, 'YYYY-MM-DD') as target_date
     FROM goals WHERE user_id = :userId AND status = 'active' AND (target_date IS NULL OR target_date >= TRUNC(SYSDATE))
     ORDER BY target_date NULLS LAST FETCH FIRST :limit ROWS ONLY`,
    { userId, limit }
  );
}

export async function getRecentCompletedGoals(userId: string, limit = 5) {
  return query<{ id: string; title: string; completed_at: string | null }>(
    `SELECT id, title, TO_CHAR(completed_at, 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"') as completed_at
     FROM goals WHERE user_id = :userId AND status = 'completed' AND completed_at IS NOT NULL
     ORDER BY completed_at DESC FETCH FIRST :limit ROWS ONLY`,
    { userId, limit }
  );
}

export async function countGoals(userId: string, status?: string) {
  const binds: Record<string, unknown> = { userId };
  let where = "user_id = :userId";
  if (status) {
    where += " AND status = :status";
    binds.status = status;
  }
  const r = await queryOne<{ cnt: number }>(`SELECT COUNT(*) as cnt FROM goals WHERE ${where}`, binds);
  return r?.cnt ?? 0;
}
