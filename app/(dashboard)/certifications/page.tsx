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
        <h1 className="text-2xl font-bold mb-6">Certifications</h1>
        <p className="text-red-600">Error loading data: {catalogError?.message ?? earnedError?.message}</p>
      </div>
    );
  }

  const earnedIds = new Set(
    (earned ?? []).map((e) => e.certification_id).filter(Boolean) as string[]
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Certifications</h1>
      {!catalog?.length ? (
        <p className="text-gray-600">
          No certification catalog yet. Seed the certification_catalog table in Supabase.
        </p>
      ) : (
        <ul className="space-y-3">
          {catalog.map((c) => (
            <li key={c.id} className="border rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-sm text-gray-600">{c.level}</p>
              </div>
              {earnedIds.has(c.id) ? (
                <span className="text-sm text-green-600">Earned</span>
              ) : (
                <form action={markCertificationEarned} className="flex items-center gap-2">
                  <input type="hidden" name="certification_id" value={c.id} />
                  <input
                    type="date"
                    name="earned_at"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    className="rounded border border-gray-300 px-2 py-1 text-sm"
                  />
                  <button
                    type="submit"
                    className="text-sm rounded bg-green-600 text-white px-3 py-1 hover:bg-green-700"
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
