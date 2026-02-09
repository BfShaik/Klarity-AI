import { createClient } from "@/lib/supabase/server";
import GoalForm from "./GoalForm";

export default async function GoalsPage() {
  const supabase = await createClient();
  const { data: goals, error } = await supabase
    .from("goals")
    .select("*")
    .order("target_date", { ascending: true, nullsFirst: false });

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Goals</h1>
        <p className="text-red-600">Error loading goals: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Goals</h1>
      <GoalForm />
      {!goals?.length ? (
        <p className="text-gray-600">No goals yet. Add a goal to track progress.</p>
      ) : (
        <ul className="space-y-3">
          {goals.map((g) => (
            <li key={g.id} className="border rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{g.title}</p>
                <p className="text-sm text-gray-600">
                  {g.target_date ? `Target: ${g.target_date}` : "No target date"}
                </p>
              </div>
              <span
                className={`text-sm px-2 py-1 rounded ${
                  g.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : g.status === "cancelled"
                    ? "bg-gray-100 text-gray-600"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {g.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
