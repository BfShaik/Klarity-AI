import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import dynamic from "next/dynamic";
import AchievementsTable from "./AchievementsTable";

const AddMilestoneForm = dynamic(() => import("./AddMilestoneForm"), { ssr: false });

export default async function AchievementsPage() {
  let achievements: Array<{ id: string; type: string; custom_title: string | null; earned_at: string }> = [];
  let loadError: string | null = null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("achievements")
      .select("id, type, custom_title, earned_at")
      .order("earned_at", { ascending: false });
    if (error) loadError = error.message;
    else achievements = data ?? [];
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Failed to load achievements.";
  }

  if (loadError) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6 text-white">Achievements</h1>
        <p className="text-red-400">Error loading achievements: {loadError}</p>
        <div className="flex gap-2 mt-4">
          <AddMilestoneForm />
          <Link href="/certifications" className="btn-secondary">Add certification</Link>
          <Link href="/badges" className="btn-secondary">Add badge</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Achievements</h1>
        <div className="flex gap-2">
          <AddMilestoneForm />
          <Link href="/certifications" className="btn-secondary">
            Add certification
          </Link>
          <Link href="/badges" className="btn-secondary">
            Add badge
          </Link>
        </div>
      </div>
      <AchievementsTable achievements={achievements ?? []} />
    </div>
  );
}
