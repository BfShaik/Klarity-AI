#!/usr/bin/env node
/**
 * Test script for chat API (uses Gemini).
 * Verifies GOOGLE_AI_API_KEY and basic chat + tool-calling.
 * Run with: node scripts/test-chat.mjs
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { GoogleGenAI, Type } from "@google/genai";

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

const apiKey = process.env.GOOGLE_AI_API_KEY;
if (!apiKey) {
  console.error("GOOGLE_AI_API_KEY not found in .env.local");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

const addAchievementDecl = {
  name: "add_achievement",
  description: "Add a milestone achievement",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      earned_at: { type: Type.STRING },
    },
    required: ["title", "earned_at"],
  },
};

async function testBasicChat() {
  console.log("1. Testing basic Gemini chat…");
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Say 'Hello from Klarity' in 5 words or less.",
  });
  const text = (response?.text ?? "").trim();
  console.log("   Response:", text);
  if (!text) throw new Error("No response content");
}

async function testToolCalling() {
  console.log("2. Testing tool-calling (add_achievement)…");
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Add achievement: Oracle Cloud Architect, earned today",
    config: {
      tools: [{ functionDeclarations: [addAchievementDecl] }],
    },
  });
  const functionCalls = response.functionCalls ?? [];
  if (functionCalls.length === 0) {
    throw new Error("Expected tool call, got none");
  }
  const fc = functionCalls[0];
  const args = fc.args ?? {};
  console.log("   Tool:", fc.name);
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
  console.log("Testing Gemini / Chat integration\n");

  await testBasicChat();
  await testToolCalling();
  await testChatEndpoint();

  console.log("\n✓ AI LLM tests passed");
}

main().catch((err) => {
  console.error("\n✗ Test failed:", err.message);
  process.exit(1);
});
