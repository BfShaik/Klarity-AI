import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import { useOracle } from "@/lib/db";
import * as oracleProfiles from "@/lib/oracle/tables/profiles";

/**
 * Ensures the current user has a row in profiles (required for FK from
 * customers, goals, notes, etc.). Inserts if missing; no-op if already exists.
 */
export async function ensureProfile(
  supabase: SupabaseClient,
  user: User
): Promise<void> {
  if (useOracle) {
    await oracleProfiles.ensureProfile(user.id, user.email ?? null);
    return;
  }
  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (error) {
    if (error.code === "23505") return;
    throw error;
  }
}
