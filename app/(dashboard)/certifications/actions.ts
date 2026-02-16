"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { withCrudLogging } from "@/lib/crud-context";
import { ensureProfile } from "@/lib/ensure-profile";

export async function markCertificationEarned(formData: FormData) {
  const certificationId = formData.get("certification_id") as string;
  const earnedAt = (formData.get("earned_at") as string) || new Date().toISOString().slice(0, 10);
  if (!certificationId) throw new Error("Certification ID is required.");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in to mark a certification.");
  await ensureProfile(supabase, user);

  return withCrudLogging(
    { operation: "markCertificationEarned", resource: "achievements", userId: user.id },
    async () => {
      const { error } = await supabase.from("achievements").insert({
        user_id: user.id,
        type: "certification",
        certification_id: certificationId,
        earned_at: earnedAt,
      });
      if (error) throw error;
      revalidatePath("/certifications");
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
