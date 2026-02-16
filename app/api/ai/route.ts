import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { toUserMessage, getErrorContextForLog } from "@/lib/errors";

export const dynamic = "force-dynamic";

// Stub: wire to OpenAI/Claude for note refinement and summary generation.
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

    if (action === "refine") {
      const text = body.text ?? "";
      if (typeof text !== "string") {
        return NextResponse.json({ error: "text must be a string" }, { status: 400 });
      }
      // TODO: send note text to LLM, return suggested edit
      logger.info("AI API request succeeded", { operation: "ai", resource: "ai", durationMs: Date.now() - start });
      return NextResponse.json({
        suggested: text ? `(AI refinement placeholder)\n\n${text}` : "",
      });
    }

    if (action === "summarize") {
      // TODO: send plans + work logs to LLM, return summary
      logger.info("AI API request succeeded", { operation: "ai", resource: "ai", durationMs: Date.now() - start });
      return NextResponse.json({ summary: "" });
    }

    return NextResponse.json({ error: "Unknown action. Use 'refine' or 'summarize'" }, { status: 400 });
  } catch (error) {
    logger.error("AI API request failed", { operation: "ai", resource: "ai", durationMs: Date.now() - start, error: getErrorContextForLog(error) });
    return NextResponse.json({ error: toUserMessage(error) }, { status: 500 });
  }
}
