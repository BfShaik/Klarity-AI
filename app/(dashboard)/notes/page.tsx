import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Suspense } from "react";
import NotesTable from "./NotesTable";
import NotesFilters from "./NotesFilters";

type SearchParams = { customer_id?: string; from?: string; to?: string };

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const customerId = params.customer_id?.trim();
  const from = params.from?.trim();
  const to = params.to?.trim();

  const supabase = await createClient();

  let notesQuery = supabase
    .from("notes")
    .select("id, title, created_at, customer_id")
    .order("updated_at", { ascending: false });

  if (customerId) {
    notesQuery = notesQuery.eq("customer_id", customerId);
  }
  if (from && /^\d{4}-\d{2}-\d{2}$/.test(from)) {
    notesQuery = notesQuery.gte("created_at", `${from}T00:00:00.000Z`);
  }
  if (to && /^\d{4}-\d{2}-\d{2}$/.test(to)) {
    notesQuery = notesQuery.lte("created_at", `${to}T23:59:59.999Z`);
  }

  const [{ data: notes, error }, { data: customers }] = await Promise.all([
    notesQuery,
    supabase.from("customers").select("id, name").order("name"),
  ]);

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
        <Link href="/notes/new" className="btn-primary">
          New note
        </Link>
      </div>
      <Suspense fallback={null}>
        <NotesFilters customers={customers ?? []} />
      </Suspense>
      <NotesTable notes={notes ?? []} customers={customers ?? []} />
    </div>
  );
}
