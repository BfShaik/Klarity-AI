"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function markCertificationEarned(formData: FormData) {
  try {
    const certificationId = formData.get("certification_id") as string;
    const earnedAt = (formData.get("earned_at") as string) || new Date().toISOString().slice(0, 10);
    if (!certificationId) throw new Error("Certification ID is required");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
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
  } catch (error) {
    console.error("Error marking certification as earned:", error);
    throw error;
  }
}
