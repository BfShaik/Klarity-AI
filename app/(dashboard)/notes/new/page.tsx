import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NoteForm from "./NoteForm";
import { createNote } from "../actions";
import { useOracle } from "@/lib/db";
import * as oracleCustomers from "@/lib/oracle/tables/customers";

export default async function NewNotePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let customers: { id: string; name: string }[] = [];
  if (useOracle) {
    try {
      customers = await oracleCustomers.getCustomersByUser(user.id);
    } catch (e) {
      console.error("Error loading customers:", e);
    }
  } else {
    const { data, error } = await supabase.from("customers").select("id, name").order("name");
    customers = data ?? [];
    if (error) console.error("Error loading customers:", error);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-white">New note</h1>
      <NoteForm customers={customers} action={createNote} />
    </div>
  );
}
