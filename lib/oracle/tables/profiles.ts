import { execute, query, queryOne } from "../db";

export async function ensureProfile(userId: string, email: string | null): Promise<void> {
  const existing = await queryOne(
    `SELECT id FROM profiles WHERE id = :id`,
    { id: userId }
  );
  if (existing) return;

  await execute(
    `INSERT INTO profiles (id, email, updated_at) VALUES (:id, :email, CURRENT_TIMESTAMP)`,
    { id: userId, email },
    { autoCommit: true }
  );
}

export async function getProfile(userId: string) {
  return queryOne<{ display_name: string | null; avatar_url: string | null; email: string | null }>(
    `SELECT display_name, avatar_url, email FROM profiles WHERE id = :id`,
    { id: userId }
  );
}

export async function updateProfile(
  userId: string,
  data: { display_name?: string | null; avatar_url?: string | null; oci_credly_username?: string }
) {
  const sets: string[] = [];
  const binds: Record<string, unknown> = { id: userId };
  if (data.display_name !== undefined) {
    sets.push("display_name = :display_name");
    binds.display_name = data.display_name;
  }
  if (data.avatar_url !== undefined) {
    sets.push("avatar_url = :avatar_url");
    binds.avatar_url = data.avatar_url;
  }
  if (data.oci_credly_username !== undefined) {
    sets.push("oci_credly_username = :oci_credly_username");
    binds.oci_credly_username = data.oci_credly_username;
  }
  if (sets.length === 0) return 0;
  sets.push("updated_at = CURRENT_TIMESTAMP");
  return execute(
    `UPDATE profiles SET ${sets.join(", ")} WHERE id = :id`,
    binds,
    { autoCommit: true }
  );
}
