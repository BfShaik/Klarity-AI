#!/usr/bin/env node
/**
 * Diagnostic test for OCI GenAI - tries regions and models to find working config.
 * Run: node scripts/test-oci-genai.mjs
 */
import { readFileSync } from "fs";
import { resolve } from "path";

const envPath = resolve(process.cwd(), ".env.local");
try {
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
    }
  }
} catch (e) {
  console.error("Could not load .env.local");
  process.exit(1);
}

const apiKey = process.env.OCI_GENAI_API_KEY;
if (!apiKey) {
  console.error("OCI_GENAI_API_KEY not found");
  process.exit(1);
}

const regions = ["us-chicago-1", "us-ashburn-1", "us-phoenix-1"];
const models = ["xai.grok-4", "xai.grok-3", "meta.llama-3.3-70b-instruct", "meta.llama-4-maverick", "openai.gpt-oss-120b"];

async function tryRequest(region, model) {
  const url = `https://inference.generativeai.${region}.oci.oraclecloud.com/20231130/actions/v1/chat/completions`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: "Say hi in 3 words." }],
      max_tokens: 32,
    }),
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: res.status, body, url };
}

async function main() {
  console.log("Testing OCI GenAI - regions:", regions.join(", "));
  console.log("Models:", models.join(", "));
  console.log("");

  for (const region of regions) {
    for (const model of models) {
      process.stdout.write(`  ${region} + ${model} ... `);
      try {
        const { status, body } = await tryRequest(region, model);
        if (status === 200) {
          const content = body?.choices?.[0]?.message?.content ?? body;
          console.log(`✓ 200 - "${String(content).slice(0, 50)}..."`);
          console.log("");
          console.log("SUCCESS - Use in .env.local:");
          console.log(`  OCI_GENAI_REGION=${region}`);
          console.log(`  OCI_GENAI_MODEL=${model}`);
          return;
        }
        const errMsg = body?.error?.message ?? body?.message ?? JSON.stringify(body)?.slice(0, 80);
        console.log(`✗ ${status} - ${errMsg}`);
      } catch (e) {
        console.log(`✗ ${e.message}`);
      }
    }
  }
  console.log("");
  console.log("No working region/model found. Check API key, policy, and model availability.");
}

main();
