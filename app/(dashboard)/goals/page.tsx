import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import GoalForm from "./GoalForm";
import GoalsTable from "./GoalsTable";
import { useOracle } from "@/lib/db";
import * as oracleGoals from "@/lib/oracle/tables/goals";
import * as oracleCertCatalog from "@/lib/oracle/tables/certification-catalog";

export default async function GoalsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let goals: { id: string; title: string; target_date: string | null; status: string; linked_certification_id: string | null }[] = [];
  let certifications: { id: string; name: string }[] = [];
  let error: Error | null = null;

  if (useOracle) {
    try {
      const [goalsData, certsData] = await Promise.all([
        oracleGoals.getGoalsByUser(user.id),
        oracleCertCatalog.getCertificationCatalog(),
      ]);
      goals = goalsData.map((g) => ({ id: g.id, title: g.title, target_date: g.target_date, status: g.status, linked_certification_id: g.linked_certification_id }));
      certifications = certsData;
    } catch (e) {
      error = e instanceof Error ? e : new Error(String(e));
    }
  } else {
    const [goalsRes, certsRes] = await Promise.all([
      supabase.from("goals").select("id, title, target_date, status, linked_certification_id").order("target_date", { ascending: true, nullsFirst: false }),
      supabase.from("certification_catalog").select("id, name").order("name"),
    ]);
    goals = goalsRes.data ?? [];
    certifications = certsRes.data ?? [];
    error = goalsRes.error ? new Error(goalsRes.error.message) : null;
  }

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
