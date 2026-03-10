import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LearningForm from "./LearningForm";
import LearningTable from "./LearningTable";
import { useOracle } from "@/lib/db";
import * as oracleLearning from "@/lib/oracle/tables/learning-progress";

export default async function LearningPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let items: { id: string; title: string; source: string; external_url: string | null; progress_percent: number }[] = [];
  let error: Error | null = null;

  if (useOracle) {
    try {
      const data = await oracleLearning.getLearningProgressByUser(user.id);
      items = data.map((d) => ({ id: d.id, title: d.title, source: d.lp_source, external_url: d.external_url, progress_percent: d.progress_percent }));
    } catch (e) {
      error = e instanceof Error ? e : new Error(String(e));
    }
  } else {
    const res = await supabase.from("learning_progress").select("id, title, source, external_url, progress_percent").order("created_at", { ascending: false });
    items = res.data ?? [];
    error = res.error ? new Error(res.error.message) : null;
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6 text-white">Learning progress</h1>
        <p className="text-red-400">Error loading learning items: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-white">Learning progress</h1>
      <LearningForm />
      <div className="mt-6">
        <LearningTable items={items ?? []} />
      </div>
    </div>
  );
}
