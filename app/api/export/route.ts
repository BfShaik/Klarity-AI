import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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

    // JSON export
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
