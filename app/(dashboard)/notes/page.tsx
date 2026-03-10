import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import NotesTable from "./NotesTable";
import NotesFilters from "./NotesFilters";
import { useOracle } from "@/lib/db";
import * as oracleNotes from "@/lib/oracle/tables/notes";
import * as oracleCustomers from "@/lib/oracle/tables/customers";

type SearchParams = { customer_id?: string; from?: string; to?: string };

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const customerId = params.customer_id?.trim() || undefined;
  const from = params.from?.trim();
  const to = params.to?.trim();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let notes: { id: string; title: string; created_at: string; customer_id: string | null }[] = [];
  let customers: { id: string; name: string }[] = [];
  let error: Error | null = null;

  if (useOracle) {
    try {
      const [notesData, customersData] = await Promise.all([
        oracleNotes.getNotesByUser(user.id, { customerId: customerId || null, fromDate: from, toDate: to }),
        oracleCustomers.getCustomersByUser(user.id),
      ]);
      notes = notesData.map((n) => ({ id: n.id, title: n.title, created_at: n.updated_at, customer_id: n.customer_id }));
      customers = customersData;
    } catch (e) {
      error = e instanceof Error ? e : new Error(String(e));
    }
  } else {
    let notesQuery = supabase
      .from("notes")
      .select("id, title, created_at, customer_id")
      .order("updated_at", { ascending: false });
    if (customerId) notesQuery = notesQuery.eq("customer_id", customerId);
    if (from && /^\d{4}-\d{2}-\d{2}$/.test(from)) notesQuery = notesQuery.gte("created_at", `${from}T00:00:00.000Z`);
    if (to && /^\d{4}-\d{2}-\d{2}$/.test(to)) notesQuery = notesQuery.lte("created_at", `${to}T23:59:59.999Z`);
    const [notesRes, customersRes] = await Promise.all([
      notesQuery,
      supabase.from("customers").select("id, name").order("name"),
    ]);
    notes = notesRes.data ?? [];
    customers = customersRes.data ?? [];
    error = notesRes.error ? new Error(notesRes.error.message) : null;
  }

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
