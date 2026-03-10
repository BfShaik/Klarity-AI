#!/usr/bin/env node
/**
 * Test /api/ai (refine, summarize) - requires valid session cookie for auth.
 * Run: node scripts/test-ai-api.mjs
 * For full E2E: sign in at localhost:3000, get cookie, set AUTH_COOKIE env.
 */
const base = process.env.CHAT_URL?.replace("/api/chat", "") || "http://localhost:3000";

async function testRefine() {
  console.log("1. Testing /api/ai (refine)...");
  const res = await fetch(`${base}/api/ai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "refine",
      text: "met with vendor discussed migration timeline",
    }),
  });
  const data = await res.json();
  if (res.status === 401) {
    console.log("   401 Unauthorized (need auth) ✓ endpoint exists");
    return;
  }
  if (res.status === 503) {
    console.log("   503:", data.error);
    return;
  }
  if (res.ok && data.suggested) {
    console.log("   ✓ refined:", data.suggested.slice(0, 80) + "...");
    return;
  }
  console.log("   Status:", res.status, data);
}

async function testSummarize() {
  console.log("2. Testing /api/ai (summarize)...");
  const res = await fetch(`${base}/api/ai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "summarize",
      plans: [{ date: "2025-02-26", content: "Review OCI deployment" }],
      workLogs: [{ date: "2025-02-26", summary: "Completed OCI GenAI integration" }],
      start: "2025-02-26",
      end: "2025-02-26",
    }),
  });
  const data = await res.json();
  if (res.status === 401) {
    console.log("   401 Unauthorized (need auth) ✓ endpoint exists");
    return;
  }
  if (res.status === 503) {
    console.log("   503:", data.error);
    return;
  }
  if (res.ok && data.summary) {
    console.log("   ✓ summary:", data.summary.slice(0, 80) + "...");
    return;
  }
  console.log("   Status:", res.status, data);
}

async function main() {
  console.log("Testing /api/ai endpoints\n");
  await testRefine();
  await testSummarize();
  console.log("\nDone.");
}

main().catch(console.error);
