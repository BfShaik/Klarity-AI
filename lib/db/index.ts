/**
 * Database abstraction: Oracle ATP for all data when configured.
 * Supabase is used only for auth (login/signup).
 */

export const useOracle = !!(
  process.env.ORACLE_USER &&
  process.env.ORACLE_PASSWORD
);
