"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addReviewEntry(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const content = (formData.get("content") as string)?.trim();
  if (!content) throw new Error("Review content is required.");

  const periodType = (formData.get("period_type") as string) || "weekly";
  const periodStart = (formData.get("period_start") as string) || new Date().toISOString().slice(0, 10);

  const { error } = await supabase.from("review_entries").insert({
    user_id: user.id,
    content,
    period_type: periodType,
    period_start: periodStart,
  });

  if (error) throw error;
  revalidatePath("/reviews");
}
