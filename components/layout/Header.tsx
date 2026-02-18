import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export async function Header() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = user
      ? await supabase.from("profiles").select("display_name, avatar_url").eq("id", user.id).maybeSingle()
      : { data: null };

    const displayName = profile?.display_name?.trim();
    const avatarUrl = profile?.avatar_url?.trim();

    return (
      <header className="border-b px-6 py-3 flex items-center justify-between" style={{ borderColor: "var(--border-dark)", backgroundColor: "var(--bg-panel)" }}>
        <span className="font-semibold" style={{ color: "var(--text-primary)" }}>Dashboard</span>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {avatarUrl && (
            <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
          )}
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>{displayName || (user?.email ?? "")}</span>
          <form action="/auth/signout" method="POST">
            <button type="submit" className="text-sm transition-colors hover:opacity-80" style={{ color: "var(--text-muted)" }}>
              Sign out
            </button>
          </form>
        </div>
      </header>
    );
  } catch {
    return (
      <header className="border-b px-6 py-3 flex items-center justify-between" style={{ borderColor: "var(--border-dark)", backgroundColor: "var(--bg-panel)" }}>
        <span className="font-semibold" style={{ color: "var(--text-primary)" }}>Klarity AI</span>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <form action="/auth/signout" method="POST">
            <button type="submit" className="text-sm transition-colors hover:opacity-80" style={{ color: "var(--text-muted)" }}>
              Sign out
            </button>
          </form>
        </div>
      </header>
    );
  }
}
