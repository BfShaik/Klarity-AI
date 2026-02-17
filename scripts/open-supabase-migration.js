#!/usr/bin/env node
/**
 * Opens Supabase SQL Editor for the project and prints the migration SQL.
 * Run: node scripts/open-supabase-migration.js
 */
const fs = require("fs");
const path = require("path");

let projectRef = process.env.SUPABASE_PROJECT_REF;
if (!projectRef) {
  try {
    const envPath = path.join(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const env = fs.readFileSync(envPath, "utf8");
      const m = env.match(/NEXT_PUBLIC_SUPABASE_URL=https:\/\/([^.]+)\.supabase\.co/);
      if (m) projectRef = m[1];
    }
  } catch (_) {}
}

const sqlPath = path.join(process.cwd(), "supabase/migrations/20260217000000_add_review_entries.sql");
const sql = fs.readFileSync(sqlPath, "utf8");

const editorUrl = projectRef
  ? `https://supabase.com/dashboard/project/${projectRef}/sql/new`
  : "https://supabase.com/dashboard/project/_/sql/new";

console.log("\n1. Open this URL in your browser:\n   " + editorUrl + "\n");
console.log("2. Paste and run this SQL:\n");
console.log("---");
console.log(sql);
console.log("---\n");

// Try to open in default browser
const { exec } = require("child_process");
const open = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
exec(`${open} "${editorUrl}"`, () => {});
