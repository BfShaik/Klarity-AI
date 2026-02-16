import { createClient } from "@/lib/supabase/server";
import WorkLogForm from "./WorkLogForm";
import WorkLogTable from "./WorkLogTable";

export default async function WorkLogPage() {
  const supabase = await createClient();
  const { data: entries, error } = await supabase
    .from("work_logs")
    .select("id, date, summary, minutes")
    .order("date", { ascending: false })
    .limit(50);

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6 text-white">Work log</h1>
        <p className="text-red-400">Error loading work log: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-white">Work log</h1>
      <WorkLogForm />
      <div className="mt-8">
        <h2 className="font-semibold mb-3 text-white">Recent entries</h2>
        <WorkLogTable entries={entries ?? []} />
      </div>
    </div>
  );
}
