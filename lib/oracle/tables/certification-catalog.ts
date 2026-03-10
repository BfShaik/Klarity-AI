import { query } from "../db";

export async function getCertificationCatalog() {
  return query<{ id: string; name: string; cert_level: string | null }>(
    `SELECT id, name, cert_level FROM certification_catalog ORDER BY name`
  );
}

export async function getCertificationIdsWithLevel() {
  return query<{ id: string; cert_level: string | null }>(
    `SELECT id, cert_level FROM certification_catalog`
  );
}

export async function getCertificationById(id: string) {
  return query<{ id: string; name: string; cert_level: string | null }>(
    `SELECT id, name, cert_level FROM certification_catalog WHERE id = :id`,
    { id }
  );
}
