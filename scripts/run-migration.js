#!/usr/bin/env node
/**
 * Run review_entries migration.
 * Requires DATABASE_URL in .env.local (from Supabase: Project Settings > Database > Connection string > URI)
 */
const fs = require("fs");
const path = require("path");

async function main() {
  let DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL && fs.existsSync(path.join(process.cwd(), ".env.local"))) {
    const env = fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8");
    const m = env.match(/DATABASE_URL=(.+)/);
    if (m) DATABASE_URL = m[1].trim().replace(/^["']|["']$/g, "");
  }
  if (!DATABASE_URL) {
    console.error("DATABASE_URL not found. Add to .env.local:");
    console.error("  DATABASE_URL=postgresql://postgres.[ref]:[PASSWORD]@aws-0-XX.pooler.supabase.com:6543/postgres");
    console.error("Get from Supabase: Project Settings > Database > Connection string > URI");
    process.exit(1);
  }

  const { Client } = require("pg");
  const sql = fs.readFileSync(
    path.join(process.cwd(), "supabase/migrations/20260217000000_add_review_entries.sql"),
    "utf8"
  );

  const client = new Client({ connectionString: DATABASE_URL });
  try {
    await client.connect();
    await client.query(sql);
    console.log("Migration applied: review_entries table created.");
  } catch (e) {
    console.error("Migration failed:", e.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
