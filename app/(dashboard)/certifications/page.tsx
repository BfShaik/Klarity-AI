import { createClient } from "@/lib/supabase/server";
import { markCertificationEarned } from "./actions";

export default async function CertificationsPage() {
  const supabase = await createClient();
  const { data: catalog, error: catalogError } = await supabase
    .from("certification_catalog")
    .select("*")
    .order("name");
  const { data: earned, error: earnedError } = await supabase
    .from("achievements")
    .select("certification_id")
    .eq("type", "certification");

  if (catalogError || earnedError) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6 text-white">Certifications</h1>
        <p className="text-red-400">Error loading data: {catalogError?.message ?? earnedError?.message}</p>
      </div>
    );
  }

  const earnedIds = new Set(
    (earned ?? []).map((e) => e.certification_id).filter(Boolean) as string[]
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-white">Certifications</h1>
      {!catalog?.length ? (
        <p className="text-slate-400">No certification catalog yet. Seed the certification_catalog table in Supabase.
        </p>
      ) : (
        <ul className="space-y-3">
          {catalog.map((c) => (
            <li key={c.id} className="card-bg p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-white">{c.name}</p>
                <p className="text-sm text-slate-400">{c.level}</p>
              </div>
              {earnedIds.has(c.id) ? (
                <span className="text-sm text-emerald-400">Earned</span>
              ) : (
                <form action={markCertificationEarned} className="flex items-center gap-2">
                  <input type="hidden" name="certification_id" value={c.id} />
                  <input
                    type="date"
                    name="earned_at"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    className="input-dark px-2 py-1 text-sm"
                  />
                  <button
                    type="submit"
                    className="btn-primary text-sm py-1 px-3"
                  >
                    Mark as earned
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
