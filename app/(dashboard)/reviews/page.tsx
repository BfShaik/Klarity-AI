import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ReviewSummary from "./ReviewSummary";
import { useOracle } from "@/lib/db";
import * as oraclePlans from "@/lib/oracle/tables/daily-plans";
import * as oracleWorkLogs from "@/lib/oracle/tables/work-logs";
import * as oracleReviewEntries from "@/lib/oracle/tables/review-entries";

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
  if (!user) redirect("/login");

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

  let plans: { date: string; content: string | null; notes: string | null }[] = [];
  let workLogs: { date: string; summary: string; minutes: number | null }[] = [];
  let reviewEntries: { id: string; content: string; created_at: string }[] = [];
  let plansError: Error | null = null;
  let workLogsError: Error | null = null;
  let reviewEntriesError: Error | null = null;

  if (useOracle) {
    try {
      const [plansData, workLogsData, reviewData] = await Promise.all([
        oraclePlans.getDailyPlansInDateRange(user.id, start, end),
        oracleWorkLogs.getWorkLogsByUser(user.id, { from: start, to: end, order: "asc", limit: 500 }),
        oracleReviewEntries.getReviewEntriesByUserAndPeriod(user.id, period, start),
      ]);
      plans = plansData.map((p) => ({ date: p.plan_date, content: p.content, notes: p.notes }));
      workLogs = workLogsData.map((w) => ({ date: w.date, summary: w.summary, minutes: w.minutes }));
      reviewEntries = reviewData;
    } catch (e) {
      plansError = e instanceof Error ? e : new Error(String(e));
    }
  } else {
    const [plansRes, workLogsRes, reviewRes] = await Promise.all([
      supabase.from("daily_plans").select("date, content, notes").gte("date", start).lte("date", end).order("date", { ascending: true }),
      supabase.from("work_logs").select("date, summary, minutes").gte("date", start).lte("date", end).order("date", { ascending: true }),
      supabase.from("review_entries").select("id, content, created_at").eq("user_id", user.id).eq("period_type", period).eq("period_start", start).order("created_at", { ascending: true }),
    ]);
    plans = plansRes.data ?? [];
    workLogs = workLogsRes.data ?? [];
    reviewEntries = reviewRes.data ?? [];
    plansError = plansRes.error ? new Error(plansRes.error.message) : null;
    workLogsError = workLogsRes.error ? new Error(workLogsRes.error.message) : null;
    reviewEntriesError = reviewRes.error ? new Error(reviewRes.error.message) : null;
  }

  if (plansError || workLogsError || reviewEntriesError) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6 text-white">Manager review</h1>
        <p className="text-red-400">Error loading data: {plansError?.message ?? workLogsError?.message ?? reviewEntriesError?.message ?? "Unknown error"}</p>
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
        reviewEntries={reviewEntries ?? []}
        start={start}
        end={end}
      />
    </div>
  );
}
