import { query } from "../db";

export async function getBadgeCatalog() {
  return query<{ id: string; name: string; image_url: string | null; description: string | null }>(
    `SELECT id, name, image_url, description FROM badge_catalog ORDER BY name`
  );
}
