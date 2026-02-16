import { createClient } from "@/lib/supabase/server";
import { markBadgeEarned } from "./actions";

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
        <h1 className="text-2xl font-bold mb-6 text-white">Badges</h1>
        <p className="text-red-400">Error loading data: {catalogError?.message ?? earnedError?.message}</p>
      </div>
    );
  }

  const earnedIds = new Set(earned?.map((e) => e.badge_id).filter(Boolean) ?? []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-white">Badges</h1>
      {!catalog?.length ? (
        <p className="text-slate-400">No badge catalog yet. Seed the badge_catalog table in Supabase.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {catalog.map((b) => (
            <div key={b.id} className="card-bg p-4 text-center">
              {b.image_url && (
                <img src={b.image_url} alt={b.name} className="w-16 h-16 mx-auto object-contain" />
              )}
              <p className="font-medium mt-2 text-white">{b.name}</p>
              {earnedIds.has(b.id) ? (
                <span className="text-sm text-emerald-400">Earned</span>
              ) : (
                <form action={markBadgeEarned} className="mt-2">
                  <input type="hidden" name="badge_id" value={b.id} />
                  <input type="hidden" name="earned_at" value={new Date().toISOString().slice(0, 10)} />
                  <button
                    type="submit"
                    className="btn-primary text-sm py-1 px-3"
                  >
                    Mark as earned
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
