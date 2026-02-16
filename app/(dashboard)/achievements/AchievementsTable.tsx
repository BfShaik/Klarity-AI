"use client";

import Link from "next/link";
import { DataGrid } from "@/components/ui/DataGrid";
import { ActionButtons } from "@/components/ui/ActionButtons";
import { deleteAchievement } from "@/app/(dashboard)/badges/actions";

type Achievement = { id: string; type: string; custom_title: string | null; earned_at: string };

export default function AchievementsTable({ achievements }: { achievements: Achievement[] }) {
  const rows = achievements.map((a) => ({
    id: a.id,
    type: a.type,
    custom_title: a.custom_title,
    earned_at: a.earned_at,
  }));

  return (
    <DataGrid
      columns={[
        {
          key: "title",
          label: "Achievement",
          render: (row) => (
            <Link href={`/achievements/${row.id}`} className="font-medium text-red-400 hover:text-red-300">
              {String(row.custom_title || row.type)}
            </Link>
          ),
        },
        { key: "earned_at", label: "Earned" },
      ]}
      data={rows}
      emptyMessage="No achievements yet. Add certifications, badges, or custom milestones."
      renderActions={(row) => (
        <div className="flex items-center justify-end gap-2">
          <Link href={`/achievements/${row.id}`} className="btn-secondary py-1.5 px-3 text-sm">
            View
          </Link>
          <ActionButtons onDelete={() => deleteAchievement(row.id as string)} />
        </div>
      )}
    />
  );
}
