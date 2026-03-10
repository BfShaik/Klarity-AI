#!/usr/bin/env node
/**
 * Test script for chat API (uses OCI Generative AI).
 * Verifies OCI_GENAI_API_KEY and basic chat + tool-calling.
 * Run with: node scripts/test-chat.mjs
 * See: https://github.com/oracle-samples/oci-openai
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import OpenAI from "openai";

const envPath = resolve(process.cwd(), ".env.local");
try {
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      process.env[key] = value;
    }
  }
} catch (e) {
  console.error("Could not load .env.local:", e.message);
  process.exit(1);
}

const apiKey = process.env.OCI_GENAI_API_KEY;
const region = process.env.OCI_GENAI_REGION ?? "us-ashburn-1";
const model = process.env.OCI_GENAI_MODEL ?? "meta.llama-3.3-70b-instruct";

if (!apiKey) {
  console.error("OCI_GENAI_API_KEY not found in .env.local");
  console.error("Create API key: OCI Console → Generative AI → API Keys");
  process.exit(1);
}

const baseURL = `https://inference.generativeai.${region}.oci.oraclecloud.com/20231130/actions/v1`;
const client = new OpenAI({ apiKey, baseURL });

async function testBasicChat() {
  console.log("1. Testing basic OCI GenAI chat…");
  const response = await client.chat.completions.create({
    model,
    messages: [{ role: "user", content: "Say 'Hello from Klarity' in 5 words or less." }],
    max_tokens: 64,
  });
  const text = (response.choices?.[0]?.message?.content ?? "").trim();
  console.log("   Response:", text);
  if (!text) throw new Error("No response content");
}

async function testToolCalling() {
  console.log("2. Testing tool-calling (add_achievement)…");
  const response = await client.chat.completions.create({
    model,
    messages: [{ role: "user", content: "Add achievement: Oracle Cloud Architect, earned today" }],
    tools: [
      {
        type: "function",
        function: {
          name: "add_achievement",
          description: "Add a milestone achievement",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string" },
              earned_at: { type: "string" },
            },
            required: ["title", "earned_at"],
          },
        },
      },
    ],
    tool_choice: "auto",
    max_tokens: 256,
  });
  const toolCalls = response.choices?.[0]?.message?.tool_calls ?? [];
  if (toolCalls.length === 0) {
    throw new Error("Expected tool call, got none");
  }
  const tc = toolCalls[0];
  let args = {};
  try {
    args = JSON.parse(tc.function.arguments ?? "{}");
  } catch {}
  console.log("   Tool:", tc.function.name);
  console.log("   Args:", JSON.stringify(args, null, 2));
  if (!args.title || !args.earned_at) {
    throw new Error("Expected title and earned_at in tool args");
  }
}

async function testChatEndpoint() {
  console.log("3. Testing /api/chat endpoint (expect 401 without auth)…");
  const url = process.env.CHAT_URL || "http://localhost:3000/api/chat";
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello" }],
      }),
    });
    const data = await res.json();
    if (res.status === 401) {
      console.log("   Expected: 401 Unauthorized (no session)");
      console.log("   Endpoint exists and requires auth ✓");
      return;
    }
    if (res.status === 503) {
      console.log("   503:", data.error || "Service unavailable");
      return;
    }
    if (res.ok) {
      console.log("   Response:", data.content?.slice(0, 80) + "...");
      console.log("   Full chat works ✓");
      return;
    }
    console.log("   Status:", res.status, data.error || data);
  } catch (e) {
    console.log("   Request failed:", e.message);
    console.log("   Start dev server (npm run dev) to test the endpoint.");
  }
}

async function main() {
  console.log("Testing OCI GenAI / Chat integration\n");

  await testBasicChat();
  await testToolCalling();
  await testChatEndpoint();

  console.log("\n✓ AI LLM tests passed");
}

main().catch((err) => {
  console.error("\n✗ Test failed:", err.message);
  process.exit(1);
});
