import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import NoteEditForm from "./NoteEditForm";
import { useOracle } from "@/lib/db";
import * as oracleNotes from "@/lib/oracle/tables/notes";
import * as oracleCustomers from "@/lib/oracle/tables/customers";

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let note: { id: string; title: string; body: string | null; customer_id: string | null; updated_at: string; source?: string } | null = null;
  let customers: { id: string; name: string }[] = [];

  if (useOracle) {
    const [noteData, customersData] = await Promise.all([
      oracleNotes.getNoteById(id, user.id),
      oracleCustomers.getCustomersByUser(user.id),
    ]);
    note = noteData ?? null;
    customers = customersData;
  } else {
    const noteRes = await supabase.from("notes").select("*").eq("id", id).single();
    const customersRes = await supabase.from("customers").select("id, name").order("name");
    note = noteRes.data;
    customers = customersRes.data ?? [];
  }

  if (!note) notFound();

  return (
    <div>
      <Link href="/notes" className="text-sm text-blue-400 hover:underline mb-4 inline-block">
        ← Back to Notes
      </Link>
      <p className="text-sm text-slate-400">
        Last updated: {note.updated_at ? new Date(note.updated_at).toLocaleString() : "—"} · Source: {note.source ?? "manual"}
      </p>
      <NoteEditForm
        note={{
          id: note.id,
          title: note.title,
          body: note.body,
          customer_id: note.customer_id,
        }}
        customers={customers}
      />
    </div>
  );
}
