"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ensureProfile } from "@/lib/ensure-profile";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in to update your profile.");

  await ensureProfile(supabase, user);

  const displayName = (formData.get("display_name") as string)?.trim() || null;
  const avatarUrl = (formData.get("avatar_url") as string)?.trim() || null;

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      avatar_url: avatarUrl || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) throw error;
  revalidatePath("/settings");
  revalidatePath("/");
}

export async function setUploadedAvatar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in to update your profile.");

  await ensureProfile(supabase, user);

  const { error } = await supabase
    .from("profiles")
    .update({
      avatar_url: "/avatars/avatar.png",
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) throw error;
  revalidatePath("/settings");
  revalidatePath("/");
}
