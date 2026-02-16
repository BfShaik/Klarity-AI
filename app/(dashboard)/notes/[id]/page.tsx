import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import NoteEditForm from "./NoteEditForm";

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

  const { data: customers } = await supabase
    .from("customers")
    .select("id, name")
    .order("name");

  return (
    <div>
      <Link href="/notes" className="text-sm text-blue-400 hover:underline mb-4 inline-block">
        ← Back to Notes
      </Link>
      <p className="text-sm text-slate-400">
        Last updated: {new Date(note.updated_at).toLocaleString()} · Source: {note.source}
      </p>
      <NoteEditForm
        note={{
          id: note.id,
          title: note.title,
          body: note.body,
          customer_id: note.customer_id,
        }}
        customers={customers ?? []}
      />
    </div>
  );
}
