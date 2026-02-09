import { createClient } from "@/lib/supabase/server";
import CustomerForm from "./CustomerForm";

export default async function CustomersPage() {
  const supabase = await createClient();
  const { data: customers, error } = await supabase
    .from("customers")
    .select("*")
    .order("name");

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Customers</h1>
        <p className="text-red-600">Error loading customers: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Customers</h1>
      <CustomerForm />
      {!customers?.length ? (
        <p className="text-gray-600">No customers yet. Add customers to link notes and work log entries.</p>
      ) : (
        <ul className="space-y-3">
          {customers.map((c) => (
            <li key={c.id} className="border rounded-lg p-4">
              <p className="font-medium">{c.name}</p>
              {c.notes && <p className="text-sm text-gray-600 mt-1">{c.notes}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
