import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { toUserMessage, getErrorContextForLog } from "@/lib/errors";

export const dynamic = "force-dynamic";

// Keyword search stub. Add semantic/vector search when embeddings are set up.
export async function GET(request: Request) {
  const start = Date.now();
  let userId: string | undefined;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    userId = user.id;
    logger.info("Search started", { operation: "search", resource: "search", userId });

    const { searchParams } = new URL(request.url);
    const raw = searchParams.get("q")?.trim();
    if (!raw) return NextResponse.json({ results: { notes: [], workLogs: [], customers: [], plans: [], achievements: [] } });

    // Escape LIKE special chars: % _ \
    const escape = (s: string) => s.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
    const q = escape(raw);
    const pattern = `%${q}%`;

    // Use separate queries for title/body, name/notes, plans, achievements, then combine and dedupe
    const [
      notesTitle,
      notesBody,
      workLogs,
      customersName,
      customersNotes,
      plansContent,
      plansNotes,
      achievementsTitle,
      achievementsDesc,
    ] = await Promise.all([
      supabase.from("notes").select("id, title, body").ilike("title", pattern),
      supabase.from("notes").select("id, title, body").ilike("body", pattern),
      supabase.from("work_logs").select("id, date, summary").ilike("summary", pattern),
      supabase.from("customers").select("id, name, notes").ilike("name", pattern),
      supabase.from("customers").select("id, name, notes").ilike("notes", pattern),
      supabase.from("daily_plans").select("id, date, content, notes").ilike("content", pattern),
      supabase.from("daily_plans").select("id, date, content, notes").ilike("notes", pattern),
      supabase.from("achievements").select("id, type, custom_title, custom_description, earned_at").ilike("custom_title", pattern),
      supabase.from("achievements").select("id, type, custom_title, custom_description, earned_at").ilike("custom_description", pattern),
    ]);

    // Check for errors
    if (notesTitle.error) throw notesTitle.error;
    if (notesBody.error) throw notesBody.error;
    if (workLogs.error) throw workLogs.error;
    if (customersName.error) throw customersName.error;
    if (customersNotes.error) throw customersNotes.error;
    if (plansContent.error) throw plansContent.error;
    if (plansNotes.error) throw plansNotes.error;
    if (achievementsTitle.error) throw achievementsTitle.error;
    if (achievementsDesc.error) throw achievementsDesc.error;

    // Combine and deduplicate notes
    const allNotes = [...(notesTitle.data ?? []), ...(notesBody.data ?? [])];
    const uniqueNotes = Array.from(
      new Map(allNotes.map((n) => [n.id, n])).values()
    );

    // Combine and deduplicate customers
    const allCustomers = [...(customersName.data ?? []), ...(customersNotes.data ?? [])];
    const uniqueCustomers = Array.from(
      new Map(allCustomers.map((c) => [c.id, c])).values()
    );

    // Combine and deduplicate plans
    const allPlans = [...(plansContent.data ?? []), ...(plansNotes.data ?? [])];
    const uniquePlans = Array.from(
      new Map(allPlans.map((p) => [p.id, p])).values()
    );

    // Combine and deduplicate achievements
    const allAchievements = [...(achievementsTitle.data ?? []), ...(achievementsDesc.data ?? [])];
    const uniqueAchievements = Array.from(
      new Map(allAchievements.map((a) => [a.id, a])).values()
    );

    logger.info("Search succeeded", { operation: "search", resource: "search", userId, durationMs: Date.now() - start });
    return NextResponse.json({
      results: {
        notes: uniqueNotes,
        workLogs: workLogs.data ?? [],
        customers: uniqueCustomers,
        plans: uniquePlans,
        achievements: uniqueAchievements,
      },
    });
  } catch (error) {
    logger.error("Search failed", { operation: "search", resource: "search", userId, durationMs: Date.now() - start, error: getErrorContextForLog(error) });
    return NextResponse.json({ error: toUserMessage(error) }, { status: 500 });
  }
}
