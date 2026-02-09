import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Stub: wire to OpenAI/Claude for note refinement and summary generation.
export async function POST(request: Request) {
  try {
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
      return NextResponse.json({ 
        suggested: text ? `(AI refinement placeholder)\n\n${text}` : "" 
      });
    }

    if (action === "summarize") {
      // TODO: send plans + work logs to LLM, return summary
      return NextResponse.json({ summary: "" });
    }

    return NextResponse.json({ error: "Unknown action. Use 'refine' or 'summarize'" }, { status: 400 });
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI processing failed" },
      { status: 500 }
    );
  }
}
