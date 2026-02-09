import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function NotesPage() {
  const supabase = await createClient();
  const { data: notes, error } = await supabase
    .from("notes")
    .select("id, title, created_at, customer_id")
    .order("updated_at", { ascending: false });

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Notes</h1>
        <p className="text-red-600">Error loading notes: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notes</h1>
        <Link
          href="/notes/new"
          className="rounded bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700"
        >
          New note
        </Link>
      </div>
      {!notes?.length ? (
        <p className="text-gray-600">No notes yet. Create a note or use voice-to-text.</p>
      ) : (
        <ul className="space-y-3">
          {notes.map((n) => (
            <li key={n.id} className="border rounded-lg p-4">
              <Link href={`/notes/${n.id}`} className="font-medium hover:underline">
                {n.title}
              </Link>
              <p className="text-sm text-gray-600 mt-1">
                {new Date(n.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
