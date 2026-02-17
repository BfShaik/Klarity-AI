import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { toUserMessage, getErrorContextForLog } from "@/lib/errors";
import { ensureProfile } from "@/lib/ensure-profile";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const start = Date.now();
  let userId: string | undefined;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await ensureProfile(supabase, user);
    userId = user.id;
    logger.info("Work log create started", { operation: "createWorkLog", resource: "work_logs", userId });

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { date, summary, minutes, customer_id } = body;
    if (!date || !summary) {
      return NextResponse.json({ error: "date and summary required" }, { status: 400 });
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 });
    }

    // Validate minutes if provided
    if (minutes != null && (typeof minutes !== "number" || minutes < 0)) {
      return NextResponse.json({ error: "minutes must be a non-negative number" }, { status: 400 });
    }

    const customerId = typeof customer_id === "string" && customer_id.trim() ? customer_id.trim() : null;

    const { error, data } = await supabase.from("work_logs").insert({
      user_id: user.id,
      date,
      summary: summary.trim(),
      minutes: minutes ?? null,
      customer_id: customerId,
    }).select().single();

    if (error) throw error;
    logger.info("Work log create succeeded", { operation: "createWorkLog", resource: "work_logs", userId, durationMs: Date.now() - start });
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    logger.error("Work log create failed", { operation: "createWorkLog", resource: "work_logs", userId, durationMs: Date.now() - start, error: getErrorContextForLog(error) });
    return NextResponse.json({ error: toUserMessage(error) }, { status: 500 });
  }
}
