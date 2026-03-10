import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { toUserMessage, getErrorContextForLog } from "@/lib/errors";
import { ociGenAI, OCI_DEFAULT_MODEL } from "@/lib/oci-genai";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const start = Date.now();
  try {
    logger.info("AI API request started", { operation: "ai", resource: "ai" });
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { action } = body;
    if (!action || typeof action !== "string") {
      return NextResponse.json({ error: "action is required" }, { status: 400 });
    }

    if (!ociGenAI) {
      return NextResponse.json(
        { error: "AI not configured. Add OCI_GENAI_API_KEY to .env.local. Create API key in OCI Console → Generative AI → API Keys." },
        { status: 503 }
      );
    }

    if (action === "refine") {
      const text = body.text ?? "";
      if (typeof text !== "string") {
        return NextResponse.json({ error: "text must be a string" }, { status: 400 });
      }
      try {
        const response = await ociGenAI.chat.completions.create({
          model: OCI_DEFAULT_MODEL,
          messages: [
            {
              role: "user",
              content: `Improve this note for clarity, structure, and professionalism. Output only the improved text, no commentary.\n\n---\n\n${text}`,
            },
          ],
          max_tokens: 2048,
        });
        const suggested = (response.choices?.[0]?.message?.content ?? "").trim();
        logger.info("AI API request succeeded", { operation: "ai", resource: "ai", durationMs: Date.now() - start });
        return NextResponse.json({ suggested: suggested || text });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        logger.error("OCI GenAI refine failed", { error: getErrorContextForLog(err), message: errMsg });
        if (errMsg.includes("API key") || errMsg.includes("403") || errMsg.includes("401")) {
          return NextResponse.json({ error: "Invalid or restricted API key. Check OCI_GENAI_API_KEY." }, { status: 503 });
        }
        if (errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("RESOURCE_EXHAUSTED")) {
          return NextResponse.json(
            { error: "API rate limit exceeded. Please wait a minute and try again." },
            { status: 429 }
          );
        }
        return NextResponse.json({ error: "AI refinement failed. Please try again." }, { status: 500 });
      }
    }

    if (action === "summarize") {
      const { plans = [], workLogs = [], start: periodStart, end: periodEnd } = body;
      if (!Array.isArray(plans) || !Array.isArray(workLogs)) {
        return NextResponse.json({ error: "plans and workLogs must be arrays" }, { status: 400 });
      }
      const plansText =
        plans.length > 0
          ? plans
              .map(
                (p: { date?: string; content?: string | null; notes?: string | null }) =>
                  `[${p.date ?? ""}] ${p.content ?? ""}${p.notes ? ` (Notes: ${p.notes})` : ""}`
              )
              .join("\n")
          : "(No plans)";
      const workLogsText =
        workLogs.length > 0
          ? workLogs
              .map(
                (w: { date?: string; summary?: string; minutes?: number | null }) =>
                  `[${w.date ?? ""}] ${w.summary ?? ""}${w.minutes != null ? ` (${w.minutes} min)` : ""}`
              )
              .join("\n")
          : "(No work log entries)";
      const prompt = `Summarize this work activity for a manager review. Be concise, highlight accomplishments.

Period: ${periodStart ?? ""} – ${periodEnd ?? ""}

Daily plans:
${plansText}

Work log:
${workLogsText}

Provide a concise summary suitable for a manager review or 1:1.`;
      try {
        const response = await ociGenAI.chat.completions.create({
          model: OCI_DEFAULT_MODEL,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1024,
        });
        const summary = (response.choices?.[0]?.message?.content ?? "").trim();
        logger.info("AI API request succeeded", { operation: "ai", resource: "ai", durationMs: Date.now() - start });
        return NextResponse.json({ summary });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        logger.error("OCI GenAI summarize failed", { error: getErrorContextForLog(err), message: errMsg });
        if (errMsg.includes("API key") || errMsg.includes("403") || errMsg.includes("401")) {
          return NextResponse.json({ error: "Invalid or restricted API key. Check OCI_GENAI_API_KEY." }, { status: 503 });
        }
        if (errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("RESOURCE_EXHAUSTED")) {
          return NextResponse.json(
            { error: "API rate limit exceeded. Please wait a minute and try again." },
            { status: 429 }
          );
        }
        return NextResponse.json({ error: "AI summary failed. Please try again." }, { status: 500 });
      }
    }

    return NextResponse.json({ error: "Unknown action. Use 'refine' or 'summarize'" }, { status: 400 });
  } catch (error) {
    logger.error("AI API request failed", { operation: "ai", resource: "ai", durationMs: Date.now() - start, error: getErrorContextForLog(error) });
    return NextResponse.json({ error: toUserMessage(error) }, { status: 500 });
  }
}
