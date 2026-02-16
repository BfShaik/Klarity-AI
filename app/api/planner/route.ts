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
    logger.info("Planner save started", { operation: "savePlan", resource: "daily_plans", userId });

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { date, content, notes, planId } = body;
    if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 });
    }

    // Validate planId format if provided (should be UUID)
    if (planId && typeof planId !== "string") {
      return NextResponse.json({ error: "Invalid planId format" }, { status: 400 });
    }

    if (planId) {
      const { error, data } = await supabase
        .from("daily_plans")
        .update({
          content: content != null ? String(content).trim() : null,
          notes: notes != null ? String(notes).trim() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", planId)
        .eq("user_id", user.id)
        .select()
        .single();
      if (error) throw error;
      logger.info("Planner save succeeded", { operation: "savePlan", resource: "daily_plans", userId, durationMs: Date.now() - start });
      return NextResponse.json({ ok: true, data });
    } else {
      const { error, data } = await supabase.from("daily_plans").insert({
        user_id: user.id,
        date,
        content: content != null ? String(content).trim() : null,
        notes: notes != null ? String(notes).trim() : null,
      }).select().single();
      if (error) throw error;
      logger.info("Planner save succeeded", { operation: "savePlan", resource: "daily_plans", userId, durationMs: Date.now() - start });
      return NextResponse.json({ ok: true, data });
    }
  } catch (error) {
    logger.error("Planner save failed", { operation: "savePlan", resource: "daily_plans", userId, durationMs: Date.now() - start, error: getErrorContextForLog(error) });
    return NextResponse.json({ error: toUserMessage(error) }, { status: 500 });
  }
}
