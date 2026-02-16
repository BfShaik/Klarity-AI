import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, email")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-white">Settings</h1>
      <div className="max-w-md space-y-4 card-bg p-5 rounded-xl">
        <div>
          <label className="block text-sm font-medium text-slate-400">Email</label>
          <p className="mt-1 text-slate-100">{profile?.email ?? user?.email ?? "—"}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400">Display name</label>
          <p className="mt-1 text-slate-100">{profile?.display_name ?? "—"}</p>
        </div>
        <p className="text-sm text-slate-400">
          Profile editing can be added here. Update display name and avatar in the profiles table or via a form.
        </p>
      </div>
    </div>
  );
}
