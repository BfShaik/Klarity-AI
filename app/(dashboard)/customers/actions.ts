"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCustomer(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const name = (formData.get("name") as string)?.trim();
    if (!name) throw new Error("Customer name is required");
    const notes = (formData.get("notes") as string)?.trim() || null;
    const { error } = await supabase.from("customers").insert({ 
      user_id: user.id, 
      name, 
      notes 
    });
    if (error) throw error;
    revalidatePath("/customers");
    revalidatePath("/notes/new");
  } catch (error) {
    console.error("Error creating customer:", error);
    throw error;
  }
}
