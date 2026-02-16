import { createClient } from "@/lib/supabase/server";
import LearningForm from "./LearningForm";
import LearningTable from "./LearningTable";

export default async function LearningPage() {
  const supabase = await createClient();
  const { data: items, error } = await supabase
    .from("learning_progress")
    .select("id, title, source, external_url, progress_percent")
    .order("created_at", { ascending: false });

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
