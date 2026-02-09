import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: note, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !note) notFound();

  return (
    <div>
      <Link href="/notes" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
        ← Back to Notes
      </Link>
      <h1 className="text-2xl font-bold">{note.title}</h1>
      <p className="text-sm text-gray-600 mt-1">
        {new Date(note.updated_at).toLocaleString()} · Source: {note.source}
      </p>
      <div className="mt-4 prose max-w-none">
        {note.body ? (
          <pre className="whitespace-pre-wrap font-sans">{note.body}</pre>
        ) : (
          <p className="text-gray-500">No body.</p>
        )}
      </div>
    </div>
  );
}
