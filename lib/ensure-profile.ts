import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

/**
 * Ensures the current user has a row in public.profiles (required for FK from
 * customers, goals, notes, etc.). Inserts if missing; no-op if already exists.
 * Call this before any insert that uses user_id → profiles(id).
 */
export async function ensureProfile(
  supabase: SupabaseClient,
  user: User
): Promise<void> {
  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (error) {
    // 23505 = unique violation — profile already exists, race is fine
    if (error.code === "23505") return;
    throw error;
  }
}
