"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { withCrudLogging } from "@/lib/crud-context";
import { ensureProfile } from "@/lib/ensure-profile";

export async function createCustomBadge(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in to add a badge.");
  await ensureProfile(supabase, user);

  const title = (formData.get("custom_title") as string)?.trim();
  if (!title) throw new Error("Badge name is required.");

  const earnedAt = (formData.get("earned_at") as string) || new Date().toISOString().slice(0, 10);
  const description = (formData.get("custom_description") as string)?.trim() || null;
  const credentialUrl = (formData.get("credential_url") as string)?.trim() || null;

  return withCrudLogging(
    { operation: "createCustomBadge", resource: "achievements", userId: user.id },
    async () => {
      const { error } = await supabase.from("achievements").insert({
        user_id: user.id,
        type: "badge",
        badge_id: null,
        custom_title: title,
        custom_description: description,
        earned_at: earnedAt,
        credential_url: credentialUrl,
      });
      if (error) throw error;
      revalidatePath("/badges");
      revalidatePath("/achievements");
      revalidatePath("/");
    }
  );
}

export async function markBadgeEarned(formData: FormData) {
  const badgeId = formData.get("badge_id") as string;
  const earnedAt = (formData.get("earned_at") as string) || new Date().toISOString().slice(0, 10);
  if (!badgeId) throw new Error("Badge ID is required.");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in to mark a badge.");
  await ensureProfile(supabase, user);

  return withCrudLogging(
    { operation: "markBadgeEarned", resource: "achievements", userId: user.id },
    async () => {
      const { error } = await supabase.from("achievements").insert({
        user_id: user.id,
        type: "badge",
        badge_id: badgeId,
        earned_at: earnedAt,
      });
      if (error) throw error;
      revalidatePath("/badges");
      revalidatePath("/achievements");
      revalidatePath("/");
    }
  );
}

export async function deleteAchievement(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in to delete an achievement.");
  return withCrudLogging(
    { operation: "deleteAchievement", resource: "achievements", userId: user.id },
    async () => {
      const { error } = await supabase.from("achievements").delete().eq("id", id).eq("user_id", user.id);
      if (error) throw error;
      revalidatePath("/certifications");
      revalidatePath("/badges");
      revalidatePath("/achievements");
      revalidatePath("/");
    }
  );
}
