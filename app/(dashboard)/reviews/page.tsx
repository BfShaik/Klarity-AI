import { createClient } from "@/lib/supabase/server";
import ReviewSummary from "./ReviewSummary";

type SearchParams = { period?: string };

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const period = params.period ?? "weekly";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const now = new Date();
  let start: string;
  let end: string;
  if (period === "annual") {
    start = `${now.getFullYear()}-01-01`;
    end = now.toISOString().slice(0, 10);
  } else if (period === "quarterly") {
    const q = Math.floor(now.getMonth() / 3) + 1;
    start = `${now.getFullYear()}-${String((q - 1) * 3 + 1).padStart(2, "0")}-01`;
    end = now.toISOString().slice(0, 10);
  } else if (period === "monthly") {
    start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    end = now.toISOString().slice(0, 10);
  } else {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    start = d.toISOString().slice(0, 10);
    end = now.toISOString().slice(0, 10);
  }

  const [{ data: plans, error: plansError }, { data: workLogs, error: workLogsError }] = await Promise.all([
    supabase
      .from("daily_plans")
      .select("date, content, notes")
      .gte("date", start)
      .lte("date", end)
      .order("date", { ascending: true }),
    supabase
      .from("work_logs")
      .select("date, summary, minutes")
      .gte("date", start)
      .lte("date", end)
      .order("date", { ascending: true }),
  ]);

  if (plansError || workLogsError) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6 text-white">Manager review</h1>
        <p className="text-red-400">Error loading data: {plansError?.message ?? workLogsError?.message}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-white">Manager review</h1>
      <ReviewSummary
        period={period}
        plans={plans ?? []}
        workLogs={workLogs ?? []}
        start={start}
        end={end}
      />
    </div>
  );
}
