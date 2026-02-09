import { createClient } from "@/lib/supabase/server";
import PlannerForm from "./PlannerForm";

export default async function PlannerPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data: plan, error } = await supabase
    .from("daily_plans")
    .select("*")
    .eq("date", today)
    .maybeSingle();

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Daily planner</h1>
        <p className="text-red-600">Error loading plan: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Daily planner</h1>
      <PlannerForm date={today} initialContent={plan?.content ?? ""} initialNotes={plan?.notes ?? ""} planId={plan?.id} />
    </div>
  );
}
