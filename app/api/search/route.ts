import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { toUserMessage, getErrorContextForLog } from "@/lib/errors";
import { useOracle } from "@/lib/db";
import * as oracleNotes from "@/lib/oracle/tables/notes";
import * as oracleWorkLogs from "@/lib/oracle/tables/work-logs";
import * as oracleCustomers from "@/lib/oracle/tables/customers";
import * as oraclePlans from "@/lib/oracle/tables/daily-plans";
import * as oracleAchievements from "@/lib/oracle/tables/achievements";

export const dynamic = "force-dynamic";

function escapeLike(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

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

    const q = escapeLike(raw);
    const pattern = `%${q}%`;

    if (useOracle) {
      const [notes, workLogs, customers, plans, achievements] = await Promise.all([
        oracleNotes.searchNotes(user.id, pattern, 20),
        oracleWorkLogs.searchWorkLogs(user.id, pattern, 20),
        oracleCustomers.searchCustomers(user.id, pattern, 20),
        oraclePlans.searchDailyPlans(user.id, pattern, 20),
        oracleAchievements.searchAchievements(user.id, pattern, 20),
      ]);

      const notesFormatted = notes.map((n) => ({ id: n.id, title: n.title, body: n.body }));
      const workLogsFormatted = workLogs.map((w) => ({ id: w.id, date: w.date, summary: w.summary }));
      const customersFormatted = customers.map((c) => ({ id: c.id, name: c.name, notes: c.notes }));
      const plansFormatted = plans.map((p) => ({ id: p.id, date: p.plan_date, content: p.content, notes: null }));
      const achievementsFormatted = achievements.map((a) => ({
        id: a.id,
        type: a.type,
        custom_title: a.custom_title,
        custom_description: a.custom_description,
        earned_at: a.earned_at,
      }));

      logger.info("Search succeeded", { operation: "search", resource: "search", userId, durationMs: Date.now() - start });
      return NextResponse.json({
        results: {
          notes: notesFormatted,
          workLogs: workLogsFormatted,
          customers: customersFormatted,
          plans: plansFormatted,
          achievements: achievementsFormatted,
        },
      });
    }

    // Supabase path
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

    if (notesTitle.error) throw notesTitle.error;
    if (notesBody.error) throw notesBody.error;
    if (workLogs.error) throw workLogs.error;
    if (customersName.error) throw customersName.error;
    if (customersNotes.error) throw customersNotes.error;
    if (plansContent.error) throw plansContent.error;
    if (plansNotes.error) throw plansNotes.error;
    if (achievementsTitle.error) throw achievementsTitle.error;
    if (achievementsDesc.error) throw achievementsDesc.error;

    const allNotes = [...(notesTitle.data ?? []), ...(notesBody.data ?? [])];
    const uniqueNotes = Array.from(new Map(allNotes.map((n) => [n.id, n])).values());
    const allCustomers = [...(customersName.data ?? []), ...(customersNotes.data ?? [])];
    const uniqueCustomers = Array.from(new Map(allCustomers.map((c) => [c.id, c])).values());
    const allPlans = [...(plansContent.data ?? []), ...(plansNotes.data ?? [])];
    const uniquePlans = Array.from(new Map(allPlans.map((p) => [p.id, p])).values());
    const allAchievements = [...(achievementsTitle.data ?? []), ...(achievementsDesc.data ?? [])];
    const uniqueAchievements = Array.from(new Map(allAchievements.map((a) => [a.id, a])).values());

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
