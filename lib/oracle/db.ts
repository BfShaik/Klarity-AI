/**
 * Oracle ATP connection pool and query helpers.
 */

import oracledb from "oracledb";
import { oracleConfig } from "./config";

let pool: oracledb.Pool | null = null;

export async function getPool(): Promise<oracledb.Pool> {
  if (!pool) {
    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
    oracledb.autoCommit = false;
    const opts: oracledb.PoolAttributes = {
      user: oracleConfig.user,
      password: oracleConfig.password,
      connectString: oracleConfig.connectString,
      poolMin: oracleConfig.poolMin,
      poolMax: oracleConfig.poolMax,
      poolIncrement: oracleConfig.poolIncrement,
    };
    if (oracleConfig.queueTimeout != null) {
      opts.queueTimeout = oracleConfig.queueTimeout;
    }
    // Thin mode mTLS: configDir + walletLocation + walletPassword for ATP
    if (oracleConfig.configDir) {
      opts.configDir = oracleConfig.configDir;
    }
    if (oracleConfig.walletLocation) {
      opts.walletLocation = oracleConfig.walletLocation;
    }
    if (oracleConfig.walletPassword) {
      opts.walletPassword = oracleConfig.walletPassword;
    }
    pool = await oracledb.createPool(opts);
  }
  return pool;
}

export async function getConnection(): Promise<oracledb.Connection> {
  const p = await getPool();
  return p.getConnection();
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.close(10);
    pool = null;
  }
}

/** Execute query and return rows. Column names are lowercased for consistency. */
export async function query<T = Record<string, unknown>>(
  sql: string,
  binds: Record<string, unknown> = {}
): Promise<T[]> {
  const conn = await getConnection();
  try {
    const result = await conn.execute<Record<string, unknown>>(sql, binds);
    const rows = (result.rows ?? []) as Record<string, unknown>[];
    return rows.map((row) => {
      const lowered: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(row)) {
        lowered[k.toLowerCase()] = v;
      }
      return lowered as unknown as T;
    });
  } finally {
    await conn.close();
  }
}

/** Execute and return single row or null. */
export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  binds: Record<string, unknown> = {}
): Promise<T | null> {
  const rows = await query<T>(sql, binds);
  return rows[0] ?? null;
}

/** Execute insert/update/delete. Returns rowsAffected. */
export async function execute(
  sql: string,
  binds: Record<string, unknown> = {},
  options?: { autoCommit?: boolean }
): Promise<number> {
  const conn = await getConnection();
  try {
    const result = await conn.execute(sql, binds);
    if (options?.autoCommit !== false) await conn.commit();
    return result.rowsAffected ?? 0;
  } finally {
    await conn.close();
  }
}
