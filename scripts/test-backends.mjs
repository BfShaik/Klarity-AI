#!/usr/bin/env node
/**
 * Test all backend APIs.
 * Run: node scripts/test-backends.mjs
 * Requires: dev server at localhost:3000 (npm run dev)
 */

const BASE = "http://localhost:3000";

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (e) {
    console.log(`  ✗ ${name}: ${e.message}`);
    return false;
  }
}

async function main() {
  console.log("Backend API Tests\n");

  let passed = 0;
  let total = 0;

  // 1. Health check (Supabase reachable = any HTTP response; 401 = reachable but key may need check)
  total++;
  const healthRes = await fetch(`${BASE}/api/health`);
  const healthData = await healthRes.json();
  if (healthData.ok) {
    console.log("  ✓ /api/health — Supabase reachable");
    passed++;
  } else if (healthData.status === 401 || healthData.error?.includes("401")) {
    console.log("  ✓ /api/health — Supabase reachable (401: check anon key if login fails)");
    passed++;
  } else if (healthData.error?.includes("Cannot reach")) {
    console.log(`  ✗ /api/health — ${healthData.error} (network/DNS)`);
  } else {
    console.log(`  ✗ /api/health — ${healthData.error || healthData.details || "unreachable"}`);
  }

  // 2. OCI GenAI — /api/ai refine (no auth)
  total++;
  const refineRes = await fetch(`${BASE}/api/ai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "refine", text: "met with team" }),
  });
  const refineData = await refineRes.json();
  if (refineRes.ok && refineData.suggested) {
    console.log("  ✓ /api/ai (refine) — OCI GenAI OK");
    passed++;
  } else {
    console.log(`  ✗ /api/ai (refine) — ${refineData.error || refineRes.status}`);
  }

  // 3. OCI GenAI — /api/ai summarize (no auth)
  total++;
  const sumRes = await fetch(`${BASE}/api/ai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "summarize",
      plans: [],
      workLogs: [{ date: "2025-02-26", summary: "Test" }],
      start: "2025-02-26",
      end: "2025-02-26",
    }),
  });
  const sumData = await sumRes.json();
  if (sumRes.ok && sumData.summary) {
    console.log("  ✓ /api/ai (summarize) — OCI GenAI OK");
    passed++;
  } else {
    console.log(`  ✗ /api/ai (summarize) — ${sumData.error || sumRes.status}`);
  }

  // 4. /api/chat — expect 401 without auth
  total++;
  const chatRes = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content: "Hi" }] }),
  });
  if (chatRes.status === 401) {
    console.log("  ✓ /api/chat — requires auth (401)");
    passed++;
  } else {
    console.log(`  ✗ /api/chat — expected 401, got ${chatRes.status}`);
  }

  // 5. /api/work-logs — expect 401 without auth
  total++;
  const wlRes = await fetch(`${BASE}/api/work-logs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date: "2025-02-26", summary: "Test" }),
  });
  if (wlRes.status === 401) {
    console.log("  ✓ /api/work-logs — requires auth (401)");
    passed++;
  } else {
    console.log(`  ✗ /api/work-logs — expected 401, got ${wlRes.status}`);
  }

  // 6. /api/search — expect 401 without auth
  total++;
  const searchRes = await fetch(`${BASE}/api/search?q=test`);
  if (searchRes.status === 401) {
    console.log("  ✓ /api/search — requires auth (401)");
    passed++;
  } else {
    console.log(`  ✗ /api/search — expected 401, got ${searchRes.status}`);
  }

  console.log(`\n${passed}/${total} tests passed`);
  process.exit(passed === total ? 0 : 1);
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
