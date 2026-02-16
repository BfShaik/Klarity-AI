import { createClient } from "@/lib/supabase/server";
import AchievementsTable from "./AchievementsTable";

export default async function AchievementsPage() {
  const supabase = await createClient();
  const { data: achievements, error } = await supabase
    .from("achievements")
    .select("id, type, custom_title, earned_at")
    .order("earned_at", { ascending: false });

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6 text-white">Achievements</h1>
        <p className="text-red-400">Error loading achievements: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-white">Achievements</h1>
      <AchievementsTable achievements={achievements ?? []} />
    </div>
  );
}
