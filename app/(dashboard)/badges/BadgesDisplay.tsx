"use client";

import { useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { markBadgeEarned } from "./actions";

type CustomBadge = { id: string; custom_title: string; custom_description: string | null; earned_at: string; credential_url?: string | null };
type CatalogBadge = { id: string; name: string; image_url?: string | null; description?: string | null };

export default function BadgesDisplay({
  customBadges,
  catalog,
  earnedIds,
}: {
  customBadges: CustomBadge[];
  catalog: CatalogBadge[];
  earnedIds: string[];
}) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const earnedSet = new Set(earnedIds);

  const gridClasses = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4";
  const listClasses = "flex flex-col gap-3";

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-300">Badge catalog</h2>
        <div className="flex rounded-lg overflow-hidden border border-slate-600/50 bg-[#282a3a]">
          <button
            type="button"
            onClick={() => setView("grid")}
            className={`p-2 ${view === "grid" ? "bg-[var(--accent-red)] text-white" : "text-slate-400 hover:text-white"}`}
            title="Grid view"
          >
            <LayoutGrid size={18} />
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={`p-2 ${view === "list" ? "bg-[var(--accent-red)] text-white" : "text-slate-400 hover:text-white"}`}
            title="List view"
          >
            <List size={18} />
          </button>
        </div>
      </div>
      <div className={view === "grid" ? gridClasses : listClasses}>
        {catalog.map((b) => (
          <div
            key={b.id}
            className={`card-bg p-4 ${view === "list" ? "flex items-center gap-4" : "text-center"}`}
          >
            {b.image_url && (
              <img
                src={b.image_url}
                alt={b.name}
                className={view === "list" ? "w-12 h-12 object-contain shrink-0" : "w-16 h-16 mx-auto object-contain"}
              />
            )}
            <div className={view === "list" ? "flex-1 min-w-0" : "mt-2"}>
              <p className="font-medium text-white">{b.name}</p>
              {view === "list" && b.description && (
                <p className="text-sm text-slate-400 mt-1 line-clamp-1">{b.description}</p>
              )}
            </div>
            <div className={view === "list" ? "shrink-0" : ""}>
              {earnedSet.has(b.id) ? (
                <span className="text-sm text-emerald-400">Earned</span>
              ) : (
                <form action={markBadgeEarned} className={view === "list" ? "" : "mt-2"}>
                  <input type="hidden" name="badge_id" value={b.id} />
                  <input type="hidden" name="earned_at" value={new Date().toISOString().slice(0, 10)} />
                  <button type="submit" className="btn-primary text-sm py-1 px-3">
                    Mark as earned
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
