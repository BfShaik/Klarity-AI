import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import NotesTable from "./NotesTable";

export default async function NotesPage() {
  const supabase = await createClient();
  const { data: notes, error } = await supabase
    .from("notes")
    .select("id, title, created_at")
    .order("updated_at", { ascending: false });

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6 text-white">Notes</h1>
        <p className="text-red-400">Error loading notes: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Notes</h1>
        <Link
          href="/notes/new"
          className="btn-primary"
        >
          New note
        </Link>
      </div>
      <NotesTable notes={notes ?? []} />
    </div>
  );
}
