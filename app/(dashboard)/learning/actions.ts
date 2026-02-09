"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createLearningItem(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const title = (formData.get("title") as string)?.trim();
    const source = (formData.get("source") as string)?.trim();
    if (!title || !source) throw new Error("Title and source are required");
    const external_url = (formData.get("external_url") as string)?.trim() || null;
    const progress_percent = Math.min(100, Math.max(0, parseInt((formData.get("progress_percent") as string) || "0", 10)));
    const { error } = await supabase.from("learning_progress").insert({
      user_id: user.id,
      title,
      source,
      external_url,
      progress_percent,
    });
    if (error) throw error;
    revalidatePath("/learning");
  } catch (error) {
    console.error("Error creating learning item:", error);
    throw error;
  }
}
