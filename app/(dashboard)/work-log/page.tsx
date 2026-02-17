import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import WorkLogForm from "./WorkLogForm";
import WorkLogTable from "./WorkLogTable";
import WorkLogFilters from "./WorkLogFilters";

type SearchParams = { from?: string; to?: string };

export default async function WorkLogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const from = params.from?.trim();
  const to = params.to?.trim();

  const supabase = await createClient();
  let query = supabase
    .from("work_logs")
    .select("id, date, summary, minutes, customer_id")
    .order("date", { ascending: false })
    .limit(100);

  if (from && /^\d{4}-\d{2}-\d{2}$/.test(from)) {
    query = query.gte("date", from);
  }
  if (to && /^\d{4}-\d{2}-\d{2}$/.test(to)) {
    query = query.lte("date", to);
  }

  const [
    { data: entries, error: entriesError },
    { data: customers },
  ] = await Promise.all([
    query,
    supabase.from("customers").select("id, name").order("name"),
  ]);

  if (entriesError) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6 text-white">Work log</h1>
        <p className="text-red-400">Error loading work log: {entriesError.message}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-white">Work log</h1>
      <WorkLogForm customers={customers ?? []} />
      <div className="mt-8">
        <h2 className="font-semibold mb-3 text-white">Recent entries</h2>
        <Suspense fallback={null}>
          <WorkLogFilters />
        </Suspense>
        <WorkLogTable entries={entries ?? []} customers={customers ?? []} />
      </div>
    </div>
  );
}
