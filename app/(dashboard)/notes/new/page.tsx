import { createClient } from "@/lib/supabase/server";
import NoteForm from "./NoteForm";
import { createNote } from "../actions";

export default async function NewNotePage() {
  const supabase = await createClient();
  const { data: customers, error } = await supabase
    .from("customers")
    .select("id, name")
    .order("name");

  if (error) {
    console.error("Error loading customers:", error);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-white">New note</h1>
      <NoteForm customers={customers ?? []} action={createNote} />
    </div>
  );
}
