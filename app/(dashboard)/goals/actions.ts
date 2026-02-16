"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { withCrudLogging } from "@/lib/crud-context";
import { ensureProfile } from "@/lib/ensure-profile";

export async function createGoal(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in to add a goal.");
  await ensureProfile(supabase, user);

  return withCrudLogging(
    { operation: "createGoal", resource: "goals", userId: user.id },
    async () => {
      const title = (formData.get("title") as string)?.trim();
      if (!title) throw new Error("Title is required.");
      const target_date = (formData.get("target_date") as string) || null;
      const { error } = await supabase.from("goals").insert({
        user_id: user.id,
        title,
        target_date,
      });
      if (error) throw error;
      revalidatePath("/goals");
    }
  );
}

export async function updateGoal(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in to update a goal.");
  return withCrudLogging(
    { operation: "updateGoal", resource: "goals", userId: user.id },
    async () => {
      const title = (formData.get("title") as string)?.trim();
      if (!title) throw new Error("Title is required.");
      const target_date = (formData.get("target_date") as string) || null;
      const status = (formData.get("status") as string)?.trim() || "active";
      const { error } = await supabase.from("goals").update({ title, target_date, status, updated_at: new Date().toISOString() }).eq("id", id).eq("user_id", user.id);
      if (error) throw error;
      revalidatePath("/goals");
    }
  );
}

export async function deleteGoal(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in to delete a goal.");
  return withCrudLogging(
    { operation: "deleteGoal", resource: "goals", userId: user.id },
    async () => {
      const { error } = await supabase.from("goals").delete().eq("id", id).eq("user_id", user.id);
      if (error) throw error;
      revalidatePath("/goals");
    }
  );
}
