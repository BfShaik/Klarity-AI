import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NoteForm from "./NoteForm";

export default async function NewNotePage() {
  const supabase = await createClient();
  const { data: customers, error } = await supabase
    .from("customers")
    .select("id, name")
    .order("name");

  if (error) {
    console.error("Error loading customers:", error);
  }

  async function createNote(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    const title = formData.get("title") as string;
    const body = (formData.get("body") as string) || null;
    const customerId = (formData.get("customer_id") as string) || null;
    const { error } = await supabase.from("notes").insert({
      user_id: user.id,
      title,
      body,
      customer_id: customerId || null,
    });
    if (error) {
      console.error("Error creating note:", error);
      // Could redirect to error page or show error - for now just redirect
    }
    redirect("/notes");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">New note</h1>
      <NoteForm customers={customers ?? []} action={createNote} />
    </div>
  );
}
