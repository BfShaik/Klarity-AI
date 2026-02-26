import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/ensure-profile";
import { NextResponse } from "next/server";
import { genAI } from "@/lib/gemini";
import { logger } from "@/lib/logger";
import { getErrorContextForLog } from "@/lib/errors";
import { Type } from "@google/genai";

export const dynamic = "force-dynamic";

const today = new Date().toISOString().slice(0, 10);
const SYSTEM_PROMPT = `You are a helpful assistant for Klarity AI, a personal work ledger app. You help users:
- Add achievements (milestones, certifications, badges)
- Add work log entries (what they did on a date)
- Add notes (meeting notes, ideas)
- Search across their data (notes, work logs, customers, plans, achievements)
- List all notes (use list_notes when user asks to "list all notes", "show my notes", "what notes do I have", etc.)

When the user asks to add something, use the appropriate tool. Extract dates from natural language (e.g. "today", "yesterday", "Jan 15" -> YYYY-MM-DD).
Today's date for reference: ${today}

Be concise and friendly. After using a tool, confirm what was added briefly.

IMPORTANT: When presenting search results, always format them in clean Markdown:
- Use **bold** for section headers (Notes, Work logs, Customers, Plans, Achievements)
- Use bullet lists (-) for each item
- Put each category on its own line, use line breaks between sections
- Example format:
**Notes**
- Title 1
- Title 2

**Work logs**
- 2025-01-15: Summary here

**Customers**
- Customer A, Customer B
`;

const TOOL_DECLARATIONS = [
  {
    name: "add_achievement",
    description: "Add a new milestone achievement (custom accomplishment, certification, or badge earned)",
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "Achievement title (e.g. Oracle Cloud Architect)" },
        description: { type: Type.STRING, description: "Optional description" },
        earned_at: { type: Type.STRING, description: "Date earned in YYYY-MM-DD format" },
      },
      required: ["title", "earned_at"],
    },
  },
  {
    name: "add_work_log",
    description: "Add a work log entry (what you did on a given date)",
    parameters: {
      type: Type.OBJECT,
      properties: {
        date: { type: Type.STRING, description: "Date in YYYY-MM-DD format" },
        summary: { type: Type.STRING, description: "What you did" },
        minutes: { type: Type.NUMBER, description: "Optional time spent in minutes" },
      },
      required: ["date", "summary"],
    },
  },
  {
    name: "add_note",
    description: "Add a new note (meeting notes, ideas, customer notes)",
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "Note title" },
        body: { type: Type.STRING, description: "Note content (optional)" },
      },
      required: ["title"],
    },
  },
  {
    name: "search",
    description: "Search by keyword across notes, work logs, customers, plans, and achievements. Use when user wants to find items containing a specific word or phrase.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: "Search query (keyword to match)" },
      },
      required: ["query"],
    },
  },
  {
    name: "list_notes",
    description: "List ALL notes for the user. Use when user asks to list notes, show all notes, what notes do I have, display my notes, etc. Do NOT use search for this.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        limit: { type: Type.NUMBER, description: "Max number of notes to return (default 50)" },
      },
      required: [],
    },
  },
];

type ContentPart = { text?: string; functionResponse?: { name: string; response: unknown }; functionCall?: { name: string; args?: Record<string, unknown> } };
type Content = { role: "user" | "model"; parts: ContentPart[] };

function convertToContents(messages: { role: string; content?: string }[]): Content[] {
  const contents: Content[] = [];
  contents.push({ role: "user", parts: [{ text: SYSTEM_PROMPT }] });
  for (const m of messages) {
    const role = m.role === "assistant" ? "model" : "user";
    if (m.content) {
      contents.push({ role: role as "user" | "model", parts: [{ text: m.content }] });
    }
  }
  return contents;
}

export async function POST(request: Request) {
  const start = Date.now();
  try {
    if (!genAI) {
      return NextResponse.json(
        { error: "Chat not configured. Add GOOGLE_AI_API_KEY to .env.local" },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await ensureProfile(supabase, user);

    const body = await request.json();
    const messages: { role: string; content?: string }[] = body.messages ?? [];
    if (messages.length === 0) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }

    let contents = convertToContents(messages);
    const config = {
      tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
      maxOutputTokens: 512,
      thinkingConfig: { thinkingBudget: 0 },
    };
    const maxTurns = 5;
    let turns = 0;
    let response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config,
    });

    let functionCalls = response.functionCalls ?? [];
    let text = (response.text ?? "").trim();

    while (functionCalls.length > 0 && turns < maxTurns) {
      turns++;
      const modelContent = response.candidates?.[0]?.content;
      if (modelContent?.parts?.length) {
        contents.push({ role: "model", parts: modelContent.parts });
      }

      const functionResponses: ContentPart[] = [];
      let searchOnlyWithFormattedResult: string | null = null;

      for (const fc of functionCalls) {
        const name = fc.name ?? "";
        const args = (fc.args ?? {}) as Record<string, unknown>;
        let result: string;

        try {
          if (name === "add_achievement") {
            const { error } = await supabase.from("achievements").insert({
              user_id: user.id,
              type: "milestone",
              custom_title: String(args.title ?? ""),
              custom_description: args.description ? String(args.description) : null,
              earned_at: String(args.earned_at ?? today),
            });
            result = error ? `Error: ${error.message}` : `Added achievement: ${args.title}`;
          } else if (name === "add_work_log") {
            const { error } = await supabase.from("work_logs").insert({
              user_id: user.id,
              date: String(args.date ?? today),
              summary: String(args.summary ?? ""),
              minutes: typeof args.minutes === "number" ? args.minutes : null,
            });
            result = error ? `Error: ${error.message}` : `Added work log: ${args.summary}`;
          } else if (name === "add_note") {
            const { error } = await supabase.from("notes").insert({
              user_id: user.id,
              title: String(args.title ?? ""),
              body: args.body ? String(args.body) : null,
            });
            result = error ? `Error: ${error.message}` : `Added note: ${args.title}`;
          } else if (name === "search") {
            const q = String(args.query ?? "").trim();
            const escape = (s: string) => s.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
            const pattern = `%${escape(q)}%`;
            const [n1, n2, workRes, custRes, planRes, achRes] = await Promise.all([
              supabase.from("notes").select("id, title").ilike("title", pattern).limit(5),
              supabase.from("notes").select("id, title").ilike("body", pattern).limit(5),
              supabase.from("work_logs").select("id, date, summary").ilike("summary", pattern).limit(5),
              supabase.from("customers").select("id, name").ilike("name", pattern).limit(5),
              supabase.from("daily_plans").select("id, date, content").ilike("content", pattern).limit(5),
              supabase.from("achievements").select("id, custom_title, earned_at").ilike("custom_title", pattern).limit(5),
            ]);
            const notes = [...(n1.data ?? []), ...(n2.data ?? [])];
            const uniqueNotes = Array.from(new Map(notes.map((n) => [n.id, n])).values());
            const lines: string[] = [];
            if (uniqueNotes.length) lines.push(`Notes:\n${uniqueNotes.map((n) => `- ${n.title}`).join("\n")}`);
            if (workRes.data?.length) lines.push(`Work logs:\n${workRes.data.map((w) => `- ${w.date}: ${w.summary.slice(0, 80)}`).join("\n")}`);
            if (custRes.data?.length) lines.push(`Customers:\n${custRes.data.map((c) => `- ${c.name}`).join("\n")}`);
            if (planRes.data?.length) lines.push(`Plans: ${planRes.data.length} matching entries found`);
            if (achRes.data?.length) lines.push(`Achievements:\n${achRes.data.map((a) => `- ${a.custom_title} (${a.earned_at})`).join("\n")}`);
            result = lines.length ? lines.join("\n\n") : "No results found.";
            const formattedSections = lines.map((line) => {
              const [header, ...rest] = line.split("\n");
              const boldHeader = header.replace(/:\s*$/, "");
              return `**${boldHeader}**\n${rest.join("\n")}`;
            });
            searchOnlyWithFormattedResult = lines.length
              ? `Here's what I found for **"${q}"**:\n\n${formattedSections.join("\n\n")}`
              : `No results found for **"${q}"**.`;
          } else if (name === "list_notes") {
            const limit = Math.min(Math.max(1, Number(args.limit) || 50), 100);
            const { data: notesData } = await supabase
              .from("notes")
              .select("id, title, body, updated_at")
              .order("updated_at", { ascending: false })
              .limit(limit);
            const notes = notesData ?? [];
            const lines: string[] = [];
            if (notes.length) {
              lines.push(`Notes:\n${notes.map((n) => `- ${n.title}${n.body ? ` — ${n.body.slice(0, 60)}${n.body.length > 60 ? "…" : ""}` : ""}`).join("\n")}`);
            }
            result = lines.length ? lines.join("\n\n") : "No notes found.";
            const formattedSections = lines.map((line) => {
              const [header, ...rest] = line.split("\n");
              const boldHeader = header.replace(/:\s*$/, "");
              return `**${boldHeader}**\n${rest.join("\n")}`;
            });
            searchOnlyWithFormattedResult = notes.length
              ? `Here are your **${notes.length}** note(s):\n\n${formattedSections.join("\n\n")}`
              : "You have no notes yet.";
          } else {
            result = `Unknown tool: ${name}`;
          }
        } catch (e) {
          result = `Error: ${e instanceof Error ? e.message : String(e)}`;
        }

        functionResponses.push({ functionResponse: { name, response: { result } } });
      }

      const singleTool = functionCalls.length === 1 && functionCalls[0]?.name;
      if (searchOnlyWithFormattedResult !== null && singleTool && (singleTool === "search" || singleTool === "list_notes")) {
        const content = searchOnlyWithFormattedResult;
        logger.info("Chat succeeded (search shortcut)", { operation: "chat", userId: user.id, durationMs: Date.now() - start });
        return NextResponse.json({ content, role: "assistant" });
      }

      contents.push({ role: "user", parts: functionResponses });

      response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents,
        config,
      });
      functionCalls = response.functionCalls ?? [];
      text = (response.text ?? "").trim();
    }

    const content = text || "Done.";
    logger.info("Chat succeeded", { operation: "chat", userId: user.id, durationMs: Date.now() - start });
    return NextResponse.json({ content, role: "assistant" });
  } catch (error) {
    logger.error("Chat failed", { operation: "chat", durationMs: Date.now() - start, error: getErrorContextForLog(error) });
    const errMsg = error instanceof Error ? error.message : "Chat failed";
    const status = errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("RESOURCE_EXHAUSTED") ? 429 : 500;
    return NextResponse.json(
      { error: errMsg },
      { status }
    );
  }
}
