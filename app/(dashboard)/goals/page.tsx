import { createClient } from "@/lib/supabase/server";
import GoalForm from "./GoalForm";
import GoalsTable from "./GoalsTable";

export default async function GoalsPage() {
  const supabase = await createClient();
  const [{ data: goals, error }, { data: certifications }] = await Promise.all([
    supabase
      .from("goals")
      .select("id, title, target_date, status, linked_certification_id")
      .order("target_date", { ascending: true, nullsFirst: false }),
    supabase.from("certification_catalog").select("id, name").order("name"),
  ]);

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6 text-white">Goals</h1>
        <p className="text-red-400">Error loading goals: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-white">Goals</h1>
      <GoalForm certifications={certifications ?? []} />
      <div className="mt-6">
        <GoalsTable goals={goals ?? []} certifications={certifications ?? []} />
      </div>
    </div>
  );
}
