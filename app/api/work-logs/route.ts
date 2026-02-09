import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { date, summary, minutes } = body;
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

    const { error, data } = await supabase.from("work_logs").insert({
      user_id: user.id,
      date,
      summary: summary.trim(),
      minutes: minutes ?? null,
    }).select().single();

    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    console.error("Work log API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save work log" },
      { status: 500 }
    );
  }
}
