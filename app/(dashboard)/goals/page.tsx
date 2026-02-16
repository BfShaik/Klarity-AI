import { createClient } from "@/lib/supabase/server";
import GoalForm from "./GoalForm";
import GoalsTable from "./GoalsTable";

export default async function GoalsPage() {
  const supabase = await createClient();
  const { data: goals, error } = await supabase
    .from("goals")
    .select("id, title, target_date, status")
    .order("target_date", { ascending: true, nullsFirst: false });

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
      <GoalForm />
      <div className="mt-6">
        <GoalsTable goals={goals ?? []} />
      </div>
    </div>
  );
}
