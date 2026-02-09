import { createClient } from "@/lib/supabase/server";
import WorkLogForm from "./WorkLogForm";

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
        <h1 className="text-2xl font-bold mb-6">Work log</h1>
        <p className="text-red-600">Error loading work log: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Work log</h1>
      <WorkLogForm />
      <div className="mt-8">
        <h2 className="font-semibold mb-3">Recent entries</h2>
        {!entries?.length ? (
          <p className="text-gray-600">No work log entries yet.</p>
        ) : (
          <ul className="space-y-3">
            {entries.map((e) => (
              <li key={e.id} className="border rounded-lg p-4">
                <p className="font-medium">{e.summary}</p>
                <p className="text-sm text-gray-600">
                  {e.date} {e.minutes != null ? `· ${e.minutes} min` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
