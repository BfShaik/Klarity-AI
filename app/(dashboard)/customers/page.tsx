import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CustomerForm from "./CustomerForm";
import CustomersTable from "./CustomersTable";
import { useOracle } from "@/lib/db";
import * as oracleCustomers from "@/lib/oracle/tables/customers";

export default async function CustomersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let customers: { id: string; name: string; notes: string | null }[] = [];
  let error: Error | null = null;

  if (useOracle) {
    try {
      customers = await oracleCustomers.getCustomersByUserWithNotes(user.id);
    } catch (e) {
      error = e instanceof Error ? e : new Error(String(e));
    }
  } else {
    const { data, error: err } = await supabase
      .from("customers")
      .select("id, name, notes")
      .order("name");
    customers = data ?? [];
    error = err ? new Error(err.message) : null;
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Customers</h1>
        <p className="text-red-400">Error loading customers: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Customers</h1>
      <CustomerForm />
      <div className="mt-6">
        <CustomersTable customers={customers ?? []} />
      </div>
    </div>
  );
}
