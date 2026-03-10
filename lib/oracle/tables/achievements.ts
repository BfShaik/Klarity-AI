import { randomUUID } from "crypto";
import { execute, query, queryOne } from "../db";

export async function getAchievementsByUser(userId: string, options?: { type?: string; fromDate?: string; toDate?: string }) {
  const binds: Record<string, unknown> = { userId };
  let where = "user_id = :userId";
  if (options?.type && ["certification", "badge", "milestone"].includes(options.type)) {
    where += " AND type = :type";
    binds.type = options.type;
  }
  if (options?.fromDate && /^\d{4}-\d{2}-\d{2}$/.test(options.fromDate)) {
    where += " AND earned_at >= TO_DATE(:fromDate, 'YYYY-MM-DD')";
    binds.fromDate = options.fromDate;
  }
  if (options?.toDate && /^\d{4}-\d{2}-\d{2}$/.test(options.toDate)) {
    where += " AND earned_at <= TO_DATE(:toDate, 'YYYY-MM-DD')";
    binds.toDate = options.toDate;
  }
  return query<{
    id: string;
    type: string;
    certification_id: string | null;
    badge_id: string | null;
    custom_title: string | null;
    custom_description: string | null;
    earned_at: string;
    credential_url: string | null;
  }>(
    `SELECT id, type, certification_id, badge_id, custom_title, custom_description,
            TO_CHAR(earned_at, 'YYYY-MM-DD') as earned_at, credential_url
     FROM achievements WHERE ${where} ORDER BY earned_at DESC`,
    binds
  );
}

export async function insertAchievement(userId: string, data: {
  type: string;
  certification_id?: string | null;
  badge_id?: string | null;
  custom_title?: string | null;
  custom_description?: string | null;
  earned_at: string;
  credential_url?: string | null;
}) {
  const id = randomUUID();
  await execute(
    `INSERT INTO achievements (id, user_id, type, certification_id, badge_id, custom_title, custom_description, earned_at, credential_url)
     VALUES (:id, :userId, :type, :certId, :badgeId, :customTitle, :customDesc, TO_DATE(:earnedAt, 'YYYY-MM-DD'), :credUrl)`,
    {
      id,
      userId,
      type: data.type,
      certId: data.certification_id ?? null,
      badgeId: data.badge_id ?? null,
      customTitle: data.custom_title ?? null,
      customDesc: data.custom_description ?? null,
      earnedAt: data.earned_at,
      credUrl: data.credential_url ?? null,
    },
    { autoCommit: true }
  );
  return { id, ...data };
}

export async function deleteAchievement(id: string, userId: string) {
  return execute(`DELETE FROM achievements WHERE id = :id AND user_id = :userId`, { id, userId }, { autoCommit: true });
}

export async function countAchievements(userId: string) {
  const r = await queryOne<{ cnt: number }>(`SELECT COUNT(*) as cnt FROM achievements WHERE user_id = :userId`, { userId });
  return r?.cnt ?? 0;
}

export async function getAchievementsByType(userId: string, type: string, options?: { certificationIdNull?: boolean; badgeIdNull?: boolean }) {
  const binds: Record<string, unknown> = { userId, type };
  let where = "user_id = :userId AND type = :type";
  if (options?.certificationIdNull) where += " AND certification_id IS NULL";
  if (options?.badgeIdNull) where += " AND badge_id IS NULL";
  return query<{ id: string; custom_title: string | null; custom_description: string | null; earned_at: string; credential_url: string | null }>(
    `SELECT id, custom_title, custom_description, TO_CHAR(earned_at, 'YYYY-MM-DD') as earned_at, credential_url
     FROM achievements WHERE ${where} ORDER BY earned_at DESC`,
    binds
  );
}

export async function getCertificationIdsEarned(userId: string) {
  return query<{ certification_id: string | null }>(
    `SELECT certification_id FROM achievements WHERE user_id = :userId AND type = 'certification'`,
    { userId }
  );
}

export async function getBadgeIdsEarned(userId: string) {
  return query<{ badge_id: string | null }>(
    `SELECT badge_id FROM achievements WHERE user_id = :userId AND type = 'badge'`,
    { userId }
  );
}

export async function searchAchievements(userId: string, pattern: string, limit = 5) {
  const p = `%${pattern}%`;
  return query<{ id: string; type: string; custom_title: string | null; custom_description: string | null; earned_at: string }>(
    `SELECT id, type, custom_title, custom_description, TO_CHAR(earned_at, 'YYYY-MM-DD') as earned_at
     FROM achievements WHERE user_id = :userId
     AND (UPPER(NVL(custom_title, '')) LIKE UPPER(:p) OR UPPER(NVL(custom_description, '')) LIKE UPPER(:p))
     FETCH FIRST :limit ROWS ONLY`,
    { userId, p, limit }
  );
}
