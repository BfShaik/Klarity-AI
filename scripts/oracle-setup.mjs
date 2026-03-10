#!/usr/bin/env node
/**
 * Oracle ATP setup: create app user and run schema.
 * Prerequisites: oracledb, admin credentials in env.
 *
 * ORACLE_ADMIN_USER=admin
 * ORACLE_ADMIN_PASSWORD=BabaLeander@2025
 * ORACLE_CONNECT_STRING=(description=...)
 *
 * Run: node scripts/oracle-setup.mjs
 */

import oracledb from "oracledb";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const config = {
  user: process.env.ORACLE_ADMIN_USER || "admin",
  password: process.env.ORACLE_ADMIN_PASSWORD || "BabaLeander@2025",
  connectString: process.env.ORACLE_CONNECT_STRING ||
    "(description=(retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.us-ashburn-1.oraclecloud.com))(connect_data=(service_name=g4454520bba5b2f_f0ljc79hji9s7az9_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))",
};

const APP_USER = "klarity_app";
const APP_PASSWORD = process.env.ORACLE_APP_PASSWORD || "KlarityApp2025!";

async function createUser(conn) {
  console.log("Creating app user...");
  try {
    await conn.execute(`CREATE USER ${APP_USER} IDENTIFIED BY "${APP_PASSWORD}"`);
    await conn.execute(`GRANT CONNECT TO ${APP_USER}`);
    await conn.execute(`GRANT RESOURCE TO ${APP_USER}`);
    await conn.execute(`GRANT CREATE VIEW TO ${APP_USER}`);
    await conn.execute(`GRANT UNLIMITED TABLESPACE TO ${APP_USER}`);
    console.log(`  User ${APP_USER} created.`);
  } catch (e) {
    if (e.message && e.message.includes("ORA-01920")) {
      console.log(`  User ${APP_USER} already exists.`);
    } else {
      throw e;
    }
  }
}

async function enableOrds(conn) {
  console.log("Enabling ORDS for SQL Worksheet / Database Actions...");
  try {
    await conn.execute(`BEGIN ORDS_ADMIN.ENABLE_SCHEMA(p_schema => 'KLARITY_APP'); END;`);
    console.log("  ORDS enabled for klarity_app.");
  } catch (e) {
    const msg = e.message || "";
    if (msg.includes("already enabled") || msg.includes("schema is already")) {
      console.log("  ORDS already enabled for klarity_app.");
    } else {
      throw e;
    }
  }
}

async function runSchema(conn) {
  console.log("Running schema...");
  const schemaPath = resolve(__dirname, "../oracle/schema.sql");
  const sql = readFileSync(schemaPath, "utf8");

  // Split by semicolon followed by newline; filter empty and comments
  const statements = sql
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith("--") && s !== "/" && s.length > 5);

  for (const stmt of statements) {
    try {
      await conn.execute(stmt);
      console.log("  OK:", stmt.slice(0, 55).replace(/\n/g, " ") + "...");
    } catch (e) {
      if (e.message && (e.message.includes("ORA-00955") || e.message.includes("ORA-02289"))) {
        console.log("  (exists):", stmt.slice(0, 45).replace(/\n/g, " ") + "...");
      } else {
        console.error("  FAIL:", stmt.slice(0, 80));
        throw e;
      }
    }
  }
}

async function main() {
  console.log("Oracle ATP Setup\n");
  let conn;
  try {
    conn = await oracledb.getConnection(config);
    console.log("Connected as admin.\n");

    await createUser(conn);
    await enableOrds(conn);
    await conn.commit();

    // Reconnect as app user to run schema
    await conn.close();
    conn = await oracledb.getConnection({
      user: APP_USER,
      password: APP_PASSWORD,
      connectString: config.connectString,
    });
    console.log(`\nConnected as ${APP_USER}.\n`);

    await runSchema(conn);
    await conn.commit();

    console.log("\nSetup complete.");
    console.log("\nAdd to .env.local:");
    console.log(`  ORACLE_USER=${APP_USER}`);
    console.log(`  ORACLE_PASSWORD=${APP_PASSWORD}`);
    console.log(`  ORACLE_CONNECT_STRING=${config.connectString}`);
  } catch (e) {
    console.error("\nError:", e.message);
    process.exit(1);
  } finally {
    if (conn) await conn.close();
    process.exit(0);
  }
}

main();
