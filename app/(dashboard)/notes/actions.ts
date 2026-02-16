"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { withCrudLogging } from "@/lib/crud-context";
import { ensureProfile } from "@/lib/ensure-profile";

export async function createNote(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await ensureProfile(supabase, user);

  await withCrudLogging(
    { operation: "createNote", resource: "notes", userId: user.id },
    async () => {
      const title = (formData.get("title") as string)?.trim();
      if (!title) throw new Error("Title is required.");
      const body = (formData.get("body") as string) || null;
      const customerId = (formData.get("customer_id") as string) || null;
      const { error } = await supabase.from("notes").insert({
        user_id: user.id,
        title,
        body,
        customer_id: customerId || null,
      });
      if (error) throw error;
      revalidatePath("/notes");
    }
  );
  redirect("/notes");
}

export async function updateNote(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await withCrudLogging(
    { operation: "updateNote", resource: "notes", userId: user.id },
    async () => {
      const title = (formData.get("title") as string)?.trim();
      if (!title) throw new Error("Title is required.");
      const body = (formData.get("body") as string) || null;
      const customerId = (formData.get("customer_id") as string) || null;
      const { error } = await supabase.from("notes").update({ title, body, customer_id: customerId || null, updated_at: new Date().toISOString() }).eq("id", id).eq("user_id", user.id);
      if (error) throw error;
      revalidatePath("/notes");
      revalidatePath(`/notes/${id}`);
    }
  );
}

export async function deleteNote(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await withCrudLogging(
    { operation: "deleteNote", resource: "notes", userId: user.id },
    async () => {
      const { error } = await supabase.from("notes").delete().eq("id", id).eq("user_id", user.id);
      if (error) throw error;
      revalidatePath("/notes");
    }
  );
  redirect("/notes");
}
