import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export async function Header() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
      <header className="border-b border-gray-200 bg-white px-6 py-3 flex items-center justify-between">
        <span className="font-semibold">Klarity AI</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.email ?? ""}</span>
          <form action="/auth/signout" method="POST">
            <button type="submit" className="text-sm text-blue-600 hover:underline">
              Sign out
            </button>
          </form>
        </div>
      </header>
    );
  } catch {
    return (
      <header className="border-b border-gray-200 bg-white px-6 py-3 flex items-center justify-between">
        <span className="font-semibold">Klarity AI</span>
        <div className="flex items-center gap-4">
          <form action="/auth/signout" method="POST">
            <button type="submit" className="text-sm text-blue-600 hover:underline">
              Sign out
            </button>
          </form>
        </div>
      </header>
    );
  }
}
