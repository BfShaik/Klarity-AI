import { createClient } from "@/lib/supabase/server";
import CustomerForm from "./CustomerForm";
import CustomersTable from "./CustomersTable";

export default async function CustomersPage() {
  const supabase = await createClient();
  const { data: customers, error } = await supabase
    .from("customers")
    .select("id, name, notes")
    .order("name");

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
