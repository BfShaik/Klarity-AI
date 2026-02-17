"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { withCrudLogging } from "@/lib/crud-context";
import { ensureProfile } from "@/lib/ensure-profile";

export async function createCustomMilestone(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in to add a milestone.");
  await ensureProfile(supabase, user);

  const title = (formData.get("custom_title") as string)?.trim();
  if (!title) throw new Error("Milestone title is required.");

  const earnedAt = (formData.get("earned_at") as string) || new Date().toISOString().slice(0, 10);
  const description = (formData.get("custom_description") as string)?.trim() || null;
  const credentialUrl = (formData.get("credential_url") as string)?.trim() || null;

  return withCrudLogging(
    { operation: "createCustomMilestone", resource: "achievements", userId: user.id },
    async () => {
      const { error } = await supabase.from("achievements").insert({
        user_id: user.id,
        type: "milestone",
        custom_title: title,
        custom_description: description,
        earned_at: earnedAt,
        credential_url: credentialUrl,
      });
      if (error) throw error;
      revalidatePath("/achievements");
      revalidatePath("/");
    }
  );
}
