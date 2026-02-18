import { GoogleGenAI } from "@google/genai";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local (same pattern as Next.js would use)
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

// Same pattern as lib/gemini.ts — explicit apiKey
const ai = new GoogleGenAI({ apiKey });

async function testDirect() {
  console.log("1. Testing direct Gemini API…");
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Explain how AI works in a few words",
  });
  console.log("   Response:", response.text);
}

async function testRefine() {
  console.log("2. Testing refine (same prompt as app)…");
  const text = "met with client discussed requirements";
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Improve this note for clarity, structure, and professionalism. Output only the improved text, no commentary.\n\n---\n\n${text}`,
  });
  const suggested = (response?.text ?? "").trim();
  console.log("   Original:", text);
  console.log("   Refined:", suggested);
}

async function testSummarize() {
  console.log("3. Testing summarize (same prompt as app)…");
  const plans = [{ date: "2025-02-07", content: "Review PRs", notes: null }];
  const workLogs = [{ date: "2025-02-07", summary: "Completed API integration", minutes: 120 }];
  const start = "Feb 1, 2025";
  const end = "Feb 7, 2025";
  const prompt = `Summarize this work activity for a manager review. Be concise, highlight accomplishments.

Period: ${start} – ${end}

Daily plans:
${plans.map((p) => `[${p.date}] ${p.content}${p.notes ? ` (Notes: ${p.notes})` : ""}`).join("\n")}

Work log:
${workLogs.map((w) => `[${w.date}] ${w.summary}${w.minutes != null ? ` (${w.minutes} min)` : ""}`).join("\n")}

Provide a concise summary suitable for a manager review or 1:1.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });
  const summary = (response?.text ?? "").trim();
  console.log("   Summary:", summary);
}

async function main() {
  await testDirect();
  await testRefine();
  await testSummarize();
  console.log("\n✓ All Gemini tests passed");
}

main().catch((err) => {
  console.error("✗ Test failed:", err.message);
  process.exit(1);
});
