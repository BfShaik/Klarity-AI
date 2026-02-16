import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function AchievementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: achievement, error } = await supabase
    .from("achievements")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !achievement) notFound();

  return (
    <div>
      <Link href="/achievements" className="text-sm text-blue-400 hover:underline mb-4 inline-block">
        ← Back to Achievements
      </Link>
      <h1 className="text-2xl font-bold text-white">{achievement.custom_title ?? achievement.type}</h1>
      <p className="text-slate-400 mt-2">Type: {achievement.type}</p>
      <p className="text-slate-400">Earned: {achievement.earned_at}</p>
      {achievement.custom_description && (
        <p className="mt-4 text-slate-300">{achievement.custom_description}</p>
      )}
      {achievement.credential_url && (
        <a href={achievement.credential_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline mt-2 inline-block">
          View credential
        </a>
      )}
    </div>
  );
}
