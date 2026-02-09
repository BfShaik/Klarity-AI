import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AchievementsPage() {
  const supabase = await createClient();
  const { data: achievements, error } = await supabase
    .from("achievements")
    .select("*")
    .order("earned_at", { ascending: false });

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Achievements</h1>
        <p className="text-red-600">Error loading achievements: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Achievements</h1>
      </div>
      {!achievements?.length ? (
        <p className="text-gray-600">No achievements yet. Add certifications, badges, or custom milestones.</p>
      ) : (
        <ul className="space-y-3">
          {achievements.map((a) => (
            <li key={a.id} className="border rounded-lg p-4">
              <Link href={`/achievements/${a.id}`} className="font-medium hover:underline">
                {a.custom_title ?? a.type}
              </Link>
              <p className="text-sm text-gray-600 mt-1">Earned: {a.earned_at}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
