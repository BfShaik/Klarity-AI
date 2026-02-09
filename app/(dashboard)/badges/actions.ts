"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function markBadgeEarned(formData: FormData) {
  try {
    const badgeId = formData.get("badge_id") as string;
    const earnedAt = (formData.get("earned_at") as string) || new Date().toISOString().slice(0, 10);
    if (!badgeId) throw new Error("Badge ID is required");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
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
  } catch (error) {
    console.error("Error marking badge as earned:", error);
    throw error;
  }
}
