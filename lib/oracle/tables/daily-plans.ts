import { randomUUID } from "crypto";
import { execute, query, queryOne } from "../db";

export async function getDailyPlanByUserAndDate(userId: string, planDate: string) {
  return queryOne<{ id: string; content: string | null; notes: string | null }>(
    `SELECT id, content, notes FROM daily_plans WHERE user_id = :userId AND plan_date = TO_DATE(:planDate, 'YYYY-MM-DD')`,
    { userId, planDate }
  );
}

export async function upsertDailyPlan(userId: string, planDate: string, data: { content?: string | null; notes?: string | null }) {
  const existing = await getDailyPlanByUserAndDate(userId, planDate);
  if (existing) {
    return execute(
      `UPDATE daily_plans SET content = :content, notes = :notes, updated_at = CURRENT_TIMESTAMP
       WHERE id = :id AND user_id = :userId`,
      { id: existing.id, userId, content: data.content ?? null, notes: data.notes ?? null },
      { autoCommit: true }
    );
  }
  const id = randomUUID();
  return execute(
    `INSERT INTO daily_plans (id, user_id, plan_date, content, notes)
     VALUES (:id, :userId, TO_DATE(:planDate, 'YYYY-MM-DD'), :content, :notes)`,
    { id, userId, planDate, content: data.content ?? null, notes: data.notes ?? null },
    { autoCommit: true }
  );
}

export async function deleteDailyPlan(id: string, userId: string) {
  return execute(`DELETE FROM daily_plans WHERE id = :id AND user_id = :userId`, { id, userId }, { autoCommit: true });
}

export async function getAllDailyPlansByUser(userId: string) {
  return query<{ id: string; plan_date: string; content: string | null; notes: string | null; created_at: string }>(
    `SELECT id, TO_CHAR(plan_date, 'YYYY-MM-DD') as plan_date, content, notes, TO_CHAR(created_at, 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"') as created_at
     FROM daily_plans WHERE user_id = :userId ORDER BY plan_date DESC`,
    { userId }
  );
}

export async function getDailyPlansInDateRange(userId: string, startDate: string, endDate: string) {
  return query<{ id: string; plan_date: string; content: string | null; notes: string | null }>(
    `SELECT id, TO_CHAR(plan_date, 'YYYY-MM-DD') as plan_date, content, notes
     FROM daily_plans WHERE user_id = :userId AND plan_date >= TO_DATE(:startDate, 'YYYY-MM-DD') AND plan_date <= TO_DATE(:endDate, 'YYYY-MM-DD')
     ORDER BY plan_date`,
    { userId, startDate, endDate }
  );
}

export async function searchDailyPlans(userId: string, pattern: string, limit = 5) {
  const p = `%${pattern}%`;
  return query<{ id: string; plan_date: string; content: string | null }>(
    `SELECT id, TO_CHAR(plan_date, 'YYYY-MM-DD') as plan_date, content
     FROM daily_plans WHERE user_id = :userId AND (UPPER(content) LIKE UPPER(:p) OR UPPER(notes) LIKE UPPER(:p))
     FETCH FIRST :limit ROWS ONLY`,
    { userId, p, limit }
  );
}
