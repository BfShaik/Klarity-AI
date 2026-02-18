import { createClient } from "@/lib/supabase/server";
import dynamic from "next/dynamic";
import BadgesDisplay from "./BadgesDisplay";

const AddBadgeForm = dynamic(() => import("./AddBadgeForm"), { ssr: false });

export default async function BadgesPage() {
  const supabase = await createClient();
  const { data: catalog, error: catalogError } = await supabase
    .from("badge_catalog")
    .select("*")
    .order("name");
  const { data: earned, error: earnedError } = await supabase
    .from("achievements")
    .select("badge_id")
    .eq("type", "badge");

  if (catalogError || earnedError) {
    return (
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-white">Badges</h1>
          <AddBadgeForm />
        </div>
        <p className="text-red-400">Error loading catalog: {catalogError?.message ?? earnedError?.message}</p>
      </div>
    );
  }

  const earnedIds = (earned?.map((e) => e.badge_id).filter(Boolean) ?? []) as string[];

  const { data: customBadges } = await supabase
    .from("achievements")
    .select("id, custom_title, custom_description, earned_at, credential_url")
    .eq("type", "badge")
    .is("badge_id", null)
    .order("earned_at", { ascending: false });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Badges</h1>
        <AddBadgeForm />
      </div>
      {customBadges && customBadges.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-300 mb-4">My badges</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {customBadges.map((b) => (
              <div key={b.id} className="card-bg p-4 text-center">
                <p className="font-medium text-white">{b.custom_title}</p>
                {b.custom_description && (
                  <p className="text-sm text-slate-400 mt-1 line-clamp-2">{b.custom_description}</p>
                )}
                <p className="text-xs text-slate-500 mt-2">{b.earned_at}</p>
                <span className="text-sm text-emerald-400">Earned</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {catalog && catalog.length > 0 && (
        <div className="mb-8">
          <BadgesDisplay
            customBadges={customBadges ?? []}
            catalog={catalog}
            earnedIds={earnedIds}
          />
        </div>
      )}
      {(!catalog?.length && (!customBadges || !customBadges.length)) ? (
        <p className="text-slate-400">No badges yet. Click &quot;Add badge&quot; above to add a custom badge, or seed the badge_catalog table in Supabase for catalog badges.</p>
      ) : null}
    </div>
  );
}
