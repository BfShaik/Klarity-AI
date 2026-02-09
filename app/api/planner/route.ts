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
      return NextResponse.json({ ok: true, data });
    } else {
      const { error, data } = await supabase.from("daily_plans").insert({
        user_id: user.id,
        date,
        content: content != null ? String(content).trim() : null,
        notes: notes != null ? String(notes).trim() : null,
      }).select().single();
      if (error) throw error;
      return NextResponse.json({ ok: true, data });
    }
  } catch (error) {
    console.error("Planner API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save plan" },
      { status: 500 }
    );
  }
}
