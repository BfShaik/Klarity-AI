import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import AchievementsTable from "./AchievementsTable";
import AchievementFilters from "./AchievementFilters";
import AchievementProgress from "./AchievementProgress";

const AddMilestoneForm = dynamic(() => import("./AddMilestoneForm"), { ssr: false });

type SearchParams = { type?: string; from?: string; to?: string };

export default async function AchievementsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const type = params.type?.trim();
  const from = params.from?.trim();
  const to = params.to?.trim();

  let achievements: Array<{ id: string; type: string; custom_title: string | null; earned_at: string }> = [];
  let loadError: string | null = null;
  let progress: {
    certificationsByLevel: Array<{ level: string; earned: number; total: number }>;
    badgeProgress: { earned: number; total: number };
    milestoneCount: number;
  } = {
    certificationsByLevel: [],
    badgeProgress: { earned: 0, total: 0 },
    milestoneCount: 0,
  };

  try {
    const supabase = await createClient();
    let query = supabase
      .from("achievements")
      .select("id, type, custom_title, earned_at")
      .order("earned_at", { ascending: false });

    if (type && ["certification", "badge", "milestone"].includes(type)) {
      query = query.eq("type", type);
    }
    if (from && /^\d{4}-\d{2}-\d{2}$/.test(from)) {
      query = query.gte("earned_at", from);
    }
    if (to && /^\d{4}-\d{2}-\d{2}$/.test(to)) {
      query = query.lte("earned_at", to);
    }

    const [
      { data: achievementData, error: achievementError },
      { data: certCatalog },
      { data: badgeCatalog },
      { data: certEarned },
      { data: badgeEarned },
    ] = await Promise.all([
      query,
      supabase.from("certification_catalog").select("id, level"),
      supabase.from("badge_catalog").select("id"),
      supabase.from("achievements").select("certification_id").eq("type", "certification"),
      supabase.from("achievements").select("badge_id").eq("type", "badge"),
    ]);

    if (achievementError) {
      loadError = achievementError.message;
    } else {
      achievements = (achievementData ?? []) as Array<{ id: string; type: string; custom_title: string | null; earned_at: string }>;

      // Build progress: certifications by level
      const certCatalogMap = new Map((certCatalog ?? []).map((c) => [c.id, c.level ?? "Other"]));
      const certsByLevel = new Map<string, { total: number; earned: number }>();
      for (const c of certCatalog ?? []) {
        const lvl = (c.level as string)?.trim() || "Other";
        const current = certsByLevel.get(lvl) ?? { total: 0, earned: 0 };
        current.total++;
        certsByLevel.set(lvl, current);
      }
      const earnedCertIds = new Set((certEarned ?? []).map((e) => e.certification_id).filter(Boolean));
      for (const certId of Array.from(earnedCertIds)) {
        const lvl = certCatalogMap.get(certId as string) ?? "Other";
        const current = certsByLevel.get(lvl);
        if (current) current.earned++;
        else certsByLevel.set(lvl, { total: 1, earned: 1 });
      }

      progress = {
        certificationsByLevel: Array.from(certsByLevel.entries()).map(([level, { earned, total }]) => ({
          level,
          earned,
          total,
        })),
        badgeProgress: {
          total: badgeCatalog?.length ?? 0,
          earned: (badgeEarned ?? []).filter((e) => e.badge_id != null).length,
        },
        milestoneCount: (achievementData ?? []).filter((a) => (a as { type: string }).type === "milestone").length,
      };
    }
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
      <Suspense fallback={null}>
        <AchievementFilters />
      </Suspense>
      <AchievementProgress progress={progress} />
      <AchievementsTable achievements={achievements ?? []} />
    </div>
  );
}
