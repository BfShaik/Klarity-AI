import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Keyword search stub. Add semantic/vector search when embeddings are set up.
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const raw = searchParams.get("q")?.trim();
    if (!raw) return NextResponse.json({ results: { notes: [], workLogs: [] } });

    // Escape LIKE special chars: % _ \
    const escape = (s: string) => s.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
    const q = escape(raw);
    const pattern = `%${q}%`;

    // Use separate queries for title and body, then combine results
    const [notesTitle, notesBody, workLogs] = await Promise.all([
      supabase.from("notes").select("id, title, body").ilike("title", pattern),
      supabase.from("notes").select("id, title, body").ilike("body", pattern),
      supabase.from("work_logs").select("id, date, summary").ilike("summary", pattern),
    ]);

    // Check for errors
    if (notesTitle.error) throw notesTitle.error;
    if (notesBody.error) throw notesBody.error;
    if (workLogs.error) throw workLogs.error;

    // Combine and deduplicate notes
    const allNotes = [...(notesTitle.data ?? []), ...(notesBody.data ?? [])];
    const uniqueNotes = Array.from(
      new Map(allNotes.map((n) => [n.id, n])).values()
    );

    return NextResponse.json({
      results: {
        notes: uniqueNotes,
        workLogs: workLogs.data ?? [],
      },
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Search failed" },
      { status: 500 }
    );
  }
}
