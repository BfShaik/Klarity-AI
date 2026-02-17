import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { updateProfile, setUploadedAvatar } from "./actions";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, email, avatar_url")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  const params = await searchParams;

  async function handleSubmit(formData: FormData) {
    "use server";
    try {
      await updateProfile(formData);
      redirect("/settings?saved=1");
    } catch (e) {
      if (e && typeof e === "object" && "digest" in e && String((e as { digest?: string }).digest).startsWith("NEXT_REDIRECT")) {
        throw e;
      }
      const msg = e instanceof Error ? e.message : "Unknown error";
      redirect(`/settings?error=${encodeURIComponent(msg)}`);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-white">Settings</h1>
      <div className="max-w-md space-y-6">
        <div className="card-bg p-5 rounded-xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400">Email</label>
            <p className="mt-1 text-slate-100">{profile?.email ?? user?.email ?? "—"}</p>
            <p className="text-xs text-slate-500 mt-0.5">Email is managed by your sign-in provider.</p>
          </div>
          <hr className="border-slate-600" />
          <h2 className="font-semibold text-white">Edit profile</h2>
          {params.saved === "1" && (
            <div className="rounded border border-emerald-500/50 bg-emerald-500/10 p-3">
              <p className="text-sm text-emerald-400">Profile updated successfully.</p>
            </div>
          )}
          {params.error && (
            <div className="rounded border border-red-500/50 bg-red-500/10 p-3">
              <p className="text-sm text-red-400">{decodeURIComponent(params.error)}</p>
            </div>
          )}
          <form action={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="display_name" className="block text-sm font-medium text-slate-300 mb-1">
                Display name
              </label>
              <input
                id="display_name"
                name="display_name"
                type="text"
                defaultValue={profile?.display_name ?? ""}
                placeholder="Your name"
                className="w-full input-dark"
              />
            </div>
            <div>
              <label htmlFor="avatar_url" className="block text-sm font-medium text-slate-300 mb-1">
                Avatar
              </label>
              <div className="flex items-center gap-4">
                {(profile?.avatar_url || "/avatars/avatar.png") && (
                  <img
                    src={profile?.avatar_url || "/avatars/avatar.png"}
                    alt=""
                    className="w-16 h-16 rounded-full object-cover border-2 border-slate-600"
                  />
                )}
                <div className="flex-1 space-y-2">
                  <form action={async () => {
                    "use server";
                    try {
                      await setUploadedAvatar();
                      redirect("/settings?saved=1");
                    } catch (e) {
                      if (e && typeof e === "object" && "digest" in e && String((e as { digest?: string }).digest).startsWith("NEXT_REDIRECT")) {
                        throw e;
                      }
                      const msg = e instanceof Error ? e.message : "Unknown error";
                      redirect(`/settings?error=${encodeURIComponent(msg)}`);
                    }
                  }}>
                    <button type="submit" className="btn-secondary text-sm">
                      Use this photo
                    </button>
                  </form>
                  <input
                    id="avatar_url"
                    name="avatar_url"
                    type="text"
                    defaultValue={profile?.avatar_url ?? "/avatars/avatar.png"}
                    placeholder="/avatars/avatar.png or https://..."
                    className="w-full input-dark"
                  />
                </div>
              </div>
              <p className="mt-1 text-xs text-slate-500">Or paste a URL to your profile image.</p>
            </div>
            <button type="submit" className="btn-primary">
              Save changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
