/**
 * Oracle ATP connection configuration.
 * For Thin mode mTLS: TNS_ADMIN (wallet path), ORACLE_TNS_ALIAS, ORACLE_WALLET_PASSWORD.
 */

const tnsAdmin = process.env.TNS_ADMIN?.trim();
const walletPassword = process.env.ORACLE_WALLET_PASSWORD?.trim();
// When using wallet, prefer TNS alias from tnsnames.ora (e.g. f0ljc79hji9s7az9_high)
const tnsAlias = process.env.ORACLE_TNS_ALIAS?.trim();

export const oracleConfig = {
  user: process.env.ORACLE_USER ?? "klarity_app",
  password: process.env.ORACLE_PASSWORD ?? "",
  connectString: (tnsAdmin && tnsAlias) ? tnsAlias : (process.env.ORACLE_CONNECT_STRING ?? 
    "(description=(retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.us-ashburn-1.oraclecloud.com))(connect_data=(service_name=g4454520bba5b2f_f0ljc79hji9s7az9_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))"),
  poolMin: 1,
  poolMax: 10,
  poolIncrement: 1,
  queueTimeout: 30000,
  // Thin mode mTLS: when TNS_ADMIN is set, use wallet
  configDir: tnsAdmin || undefined,
  walletLocation: tnsAdmin || undefined,
  walletPassword: walletPassword || undefined,
};

/** Admin credentials for running setup scripts (create user, schema) */
export const oracleAdminConfig = {
  user: process.env.ORACLE_ADMIN_USER ?? "admin",
  password: process.env.ORACLE_ADMIN_PASSWORD ?? "BabaLeander@2025",
  connectString: process.env.ORACLE_CONNECT_STRING ?? oracleConfig.connectString,
};
