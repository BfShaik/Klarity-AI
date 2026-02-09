"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createGoal(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const title = (formData.get("title") as string)?.trim();
    if (!title) throw new Error("Title is required");
    const target_date = (formData.get("target_date") as string) || null;
    const { error } = await supabase.from("goals").insert({ 
      user_id: user.id, 
      title, 
      target_date 
    });
    if (error) throw error;
    revalidatePath("/goals");
  } catch (error) {
    console.error("Error creating goal:", error);
    throw error;
  }
}
