import { createClient } from "@/lib/supabase/server";
import dynamic from "next/dynamic";
import { markCertificationEarned } from "./actions";

const AddCertificationForm = dynamic(() => import("./AddCertificationForm"), { ssr: false });

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-white">Certifications</h1>
          <AddCertificationForm />
        </div>
        <p className="text-red-400">Error loading catalog: {catalogError?.message ?? earnedError?.message}</p>
      </div>
    );
  }

  const earnedIds = new Set(
    (earned ?? []).map((e) => e.certification_id).filter(Boolean) as string[]
  );

  const { data: customCerts } = await supabase
    .from("achievements")
    .select("id, custom_title, custom_description, earned_at, credential_url")
    .eq("type", "certification")
    .is("certification_id", null)
    .order("earned_at", { ascending: false });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Certifications</h1>
        <AddCertificationForm />
      </div>
      {customCerts && customCerts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-300 mb-4">My certifications</h2>
          <ul className="space-y-3">
            {customCerts.map((c) => (
              <li key={c.id} className="card-bg p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{c.custom_title}</p>
                  {c.custom_description && (
                    <p className="text-sm text-slate-400 whitespace-pre-line">{c.custom_description}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">{c.earned_at}</p>
                </div>
                <span className="text-sm text-emerald-400">Earned</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {catalog && catalog.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-300 mb-4">Certification catalog</h2>
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
        </div>
      )}
      {(!catalog?.length && (!customCerts || !customCerts.length)) && (
        <p className="text-slate-400">No certifications yet. Click &quot;Add certification&quot; above to add a custom certification, or seed the certification_catalog table in Supabase for catalog certifications.</p>
      )}
    </div>
  );
}
