import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { useOracle } from "@/lib/db";
import * as oracleGoals from "@/lib/oracle/tables/goals";
import * as oracleAchievements from "@/lib/oracle/tables/achievements";
import * as oracleNotes from "@/lib/oracle/tables/notes";
import * as oracleWorkLogs from "@/lib/oracle/tables/work-logs";
import * as oracleLearning from "@/lib/oracle/tables/learning-progress";
import * as oracleCustomers from "@/lib/oracle/tables/customers";
import * as oraclePlans from "@/lib/oracle/tables/daily-plans";
import * as oracleReviews from "@/lib/oracle/tables/review-entries";

export const dynamic = "force-dynamic";

type ExportTable = "work_logs" | "goals" | "notes" | "achievements" | "learning_progress" | "customers" | "daily_plans" | "review_entries";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json";
    const table = searchParams.get("table") as ExportTable | null;

    const tables: ExportTable[] = [
      "goals",
      "achievements",
      "notes",
      "work_logs",
      "learning_progress",
      "customers",
      "daily_plans",
      "review_entries",
    ];

    if (useOracle) {
      const [goals, achievements, notes, workLogs, learning, customers, plans, reviews] = await Promise.all([
        oracleGoals.getGoalsByUser(user.id),
        oracleAchievements.getAchievementsByUser(user.id),
        oracleNotes.getNotesByUser(user.id),
        oracleWorkLogs.getWorkLogsByUser(user.id, { limit: 10000 }),
        oracleLearning.getLearningProgressByUser(user.id),
        oracleCustomers.getCustomersByUserWithNotes(user.id),
        oraclePlans.getAllDailyPlansByUser(user.id),
        oracleReviews.getAllReviewEntriesByUser(user.id),
      ]);

      const result: Record<string, unknown[]> = {
        goals: goals.map((g) => ({
          id: g.id,
          user_id: user.id,
          title: g.title,
          target_date: g.target_date,
          linked_certification_id: g.linked_certification_id,
          status: g.status,
          completed_at: g.completed_at,
          created_at: null,
          updated_at: null,
        })),
        achievements: achievements.map((a) => ({
          id: a.id,
          user_id: user.id,
          type: a.type,
          certification_id: a.certification_id,
          badge_id: a.badge_id,
          custom_title: a.custom_title,
          custom_description: a.custom_description,
          earned_at: a.earned_at,
          credential_url: a.credential_url,
          created_at: null,
        })),
        notes: notes.map((n) => ({
          id: n.id,
          user_id: user.id,
          title: n.title,
          body: n.body,
          customer_id: n.customer_id,
          created_at: n.created_at,
          updated_at: n.updated_at,
        })),
        work_logs: workLogs.map((w) => ({
          id: w.id,
          user_id: user.id,
          date: w.date,
          summary: w.summary,
          minutes: w.minutes,
          customer_id: w.customer_id,
          created_at: null,
          updated_at: null,
        })),
        learning_progress: learning.map((l) => ({
          id: l.id,
          user_id: user.id,
          source: l.lp_source,
          title: l.title,
          external_url: l.external_url,
          progress_percent: l.progress_percent,
          completed_at: l.completed_at,
          created_at: null,
          updated_at: null,
        })),
        customers: customers.map((c) => ({
          id: c.id,
          user_id: user.id,
          name: c.name,
          notes: c.notes,
          created_at: null,
          updated_at: null,
        })),
        daily_plans: plans.map((p) => ({
          id: p.id,
          user_id: user.id,
          date: p.plan_date,
          content: p.content,
          notes: p.notes,
          created_at: p.created_at,
          updated_at: null,
        })),
        review_entries: reviews.map((r) => ({
          id: r.id,
          user_id: user.id,
          content: r.content,
          period_type: r.period_type,
          period_start: r.period_start,
          created_at: r.created_at,
        })),
      };

      if (format === "csv") {
        const exportTable = table && tables.includes(table) ? table : "work_logs";
        const rows = result[exportTable] as Record<string, unknown>[];
        if (rows.length === 0) {
          const headers = new Headers({ "Content-Disposition": `attachment; filename="${exportTable}.csv"` });
          return new NextResponse("", { status: 200, headers });
        }
        const keys = Object.keys(rows[0]);
        const header = keys.map((k) => `"${String(k).replace(/"/g, '""')}"`).join(",");
        const lines = rows.map((row) =>
          keys.map((k) => `"${String(row[k] ?? "").replace(/"/g, '""')}"`).join(",")
        );
        const csv = [header, ...lines].join("\n");
        return new NextResponse(csv, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${exportTable}-export.csv"`,
          },
        });
      }

      return new NextResponse(JSON.stringify(result, null, 2), {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": 'attachment; filename="klarity-export.json"',
        },
      });
    }

    // Supabase path
    if (format === "csv") {
      const exportTable = table && tables.includes(table) ? table : "work_logs";
      const { data, error } = await supabase.from(exportTable).select("*").order("created_at", { ascending: false });

      if (error) throw error;

      const rows = (data ?? []) as Record<string, unknown>[];
      if (rows.length === 0) {
        const headers = new Headers({ "Content-Disposition": `attachment; filename="${exportTable}.csv"` });
        return new NextResponse("", { status: 200, headers });
      }

      const keys = Object.keys(rows[0]);
      const header = keys.map((k) => `"${String(k).replace(/"/g, '""')}"`).join(",");
      const lines = rows.map((row) =>
        keys.map((k) => `"${String(row[k] ?? "").replace(/"/g, '""')}"`).join(",")
      );
      const csv = [header, ...lines].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${exportTable}-export.csv"`,
        },
      });
    }

    const result: Record<string, unknown[]> = {};
    for (const t of tables) {
      const { data, error } = await supabase.from(t).select("*");
      if (error) {
        result[t] = [];
      } else {
        result[t] = (data ?? []) as unknown[];
      }
    }

    return new NextResponse(JSON.stringify(result, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": 'attachment; filename="klarity-export.json"',
      },
    });
  } catch (error) {
    console.error("Export failed:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
