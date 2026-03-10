import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PlannerForm from "./PlannerForm";
import { useOracle } from "@/lib/db";
import * as oraclePlans from "@/lib/oracle/tables/daily-plans";

export default async function PlannerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date().toISOString().slice(0, 10);
  let plan: { id: string; content: string | null; notes: string | null } | null = null;
  let error: Error | null = null;

  if (useOracle) {
    try {
      plan = await oraclePlans.getDailyPlanByUserAndDate(user.id, today);
    } catch (e) {
      error = e instanceof Error ? e : new Error(String(e));
    }
  } else {
    const res = await supabase.from("daily_plans").select("*").eq("date", today).maybeSingle();
    plan = res.data;
    error = res.error ? new Error(res.error.message) : null;
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6 text-white">Daily planner</h1>
        <p className="text-red-400">Error loading plan: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-white">Daily planner</h1>
      <PlannerForm date={today} initialContent={plan?.content ?? ""} initialNotes={plan?.notes ?? ""} planId={plan?.id ?? undefined} />
    </div>
  );
}
