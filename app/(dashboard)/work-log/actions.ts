"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { withCrudLogging } from "@/lib/crud-context";
import { ensureProfile } from "@/lib/ensure-profile";

export async function updateWorkLog(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in to update a work log entry.");
  await ensureProfile(supabase, user);
  return withCrudLogging(
    { operation: "updateWorkLog", resource: "work_logs", userId: user.id },
    async () => {
      const date = (formData.get("date") as string)?.trim();
      const summary = (formData.get("summary") as string)?.trim();
      if (!date || !summary) throw new Error("Date and summary are required.");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Invalid date format. Use YYYY-MM-DD.");
      const minutesRaw = formData.get("minutes");
      const minutes = minutesRaw !== null && minutesRaw !== "" ? Math.max(0, parseInt(String(minutesRaw), 10)) : null;
      const { error } = await supabase
        .from("work_logs")
        .update({ date, summary, minutes, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
      revalidatePath("/work-log");
    }
  );
}

export async function deleteWorkLog(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in to delete a work log entry.");
  return withCrudLogging(
    { operation: "deleteWorkLog", resource: "work_logs", userId: user.id },
    async () => {
      const { error } = await supabase.from("work_logs").delete().eq("id", id).eq("user_id", user.id);
      if (error) throw error;
      revalidatePath("/work-log");
    }
  );
}
