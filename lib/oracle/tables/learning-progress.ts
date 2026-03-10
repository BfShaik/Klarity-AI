import { randomUUID } from "crypto";
import { execute, query, queryOne } from "../db";

export async function getLearningProgressByUser(userId: string) {
  return query<{
    id: string;
    lp_source: string;
    title: string;
    external_url: string | null;
    progress_percent: number;
    completed_at: string | null;
  }>(
    `SELECT id, lp_source, title, external_url, progress_percent,
            TO_CHAR(completed_at, 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"') as completed_at
     FROM learning_progress WHERE user_id = :userId ORDER BY created_at DESC`,
    { userId }
  );
}

export async function insertLearningProgress(userId: string, data: {
  lp_source: string;
  title: string;
  external_url?: string | null;
  progress_percent?: number;
}) {
  const id = randomUUID();
  await execute(
    `INSERT INTO learning_progress (id, user_id, lp_source, title, external_url, progress_percent)
     VALUES (:id, :userId, :lpSource, :title, :extUrl, :progressPct)`,
    {
      id,
      userId,
      lpSource: data.lp_source,
      title: data.title.trim(),
      extUrl: data.external_url ?? null,
      progressPct: data.progress_percent ?? 0,
    },
    { autoCommit: true }
  );
  return { id, ...data };
}

export async function updateLearningProgress(id: string, userId: string, data: {
  title?: string;
  lp_source?: string;
  external_url?: string | null;
  progress_percent?: number;
}) {
  const sets: string[] = [];
  const binds: Record<string, unknown> = { id, userId };
  if (data.title !== undefined) {
    sets.push("title = :title");
    binds.title = data.title.trim();
  }
  if (data.lp_source !== undefined) {
    sets.push("lp_source = :lpSource");
    binds.lpSource = data.lp_source;
  }
  if (data.external_url !== undefined) {
    sets.push("external_url = :extUrl");
    binds.extUrl = data.external_url;
  }
  if (data.progress_percent !== undefined) {
    sets.push("progress_percent = :progressPct");
    binds.progressPct = data.progress_percent;
  }
  if (sets.length === 0) return 0;
  sets.push("updated_at = CURRENT_TIMESTAMP");
  return execute(`UPDATE learning_progress SET ${sets.join(", ")} WHERE id = :id AND user_id = :userId`, binds, { autoCommit: true });
}

export async function deleteLearningProgress(id: string, userId: string) {
  return execute(`DELETE FROM learning_progress WHERE id = :id AND user_id = :userId`, { id, userId }, { autoCommit: true });
}
