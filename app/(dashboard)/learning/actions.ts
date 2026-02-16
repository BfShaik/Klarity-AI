"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { withCrudLogging } from "@/lib/crud-context";
import { ensureProfile } from "@/lib/ensure-profile";

export async function createLearningItem(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in to add a learning item.");
  await ensureProfile(supabase, user);

  return withCrudLogging(
    { operation: "createLearningItem", resource: "learning_progress", userId: user.id },
    async () => {
      const title = (formData.get("title") as string)?.trim();
      const source = (formData.get("source") as string)?.trim();
      if (!title || !source) throw new Error("Title and source are required.");
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
    }
  );
}

export async function updateLearningItem(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in to update a learning item.");
  return withCrudLogging(
    { operation: "updateLearningItem", resource: "learning_progress", userId: user.id },
    async () => {
      const title = (formData.get("title") as string)?.trim();
      const source = (formData.get("source") as string)?.trim();
      if (!title || !source) throw new Error("Title and source are required.");
      const external_url = (formData.get("external_url") as string)?.trim() || null;
      const progress_percent = Math.min(100, Math.max(0, parseInt((formData.get("progress_percent") as string) || "0", 10)));
      const { error } = await supabase.from("learning_progress").update({ title, source, external_url, progress_percent, updated_at: new Date().toISOString() }).eq("id", id).eq("user_id", user.id);
      if (error) throw error;
      revalidatePath("/learning");
    }
  );
}

export async function deleteLearningItem(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in to delete a learning item.");
  return withCrudLogging(
    { operation: "deleteLearningItem", resource: "learning_progress", userId: user.id },
    async () => {
      const { error } = await supabase.from("learning_progress").delete().eq("id", id).eq("user_id", user.id);
      if (error) throw error;
      revalidatePath("/learning");
    }
  );
}
