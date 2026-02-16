"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DataGrid } from "@/components/ui/DataGrid";
import { ActionButtons } from "@/components/ui/ActionButtons";
import { Modal } from "@/components/ui/Modal";
import { updateCustomer, deleteCustomer } from "./actions";

type Customer = { id: string; name: string; notes: string | null };

export default function CustomersTable({ customers }: { customers: Customer[] }) {
  const [editing, setEditing] = useState<Customer | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleUpdate(formData: FormData) {
    if (!editing) return;
    setError(null);
    startTransition(async () => {
      try {
        await updateCustomer(editing.id, formData);
        setEditing(null);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not update.");
      }
    });
  }

  const rows = customers.map((c) => ({ ...c, id: c.id }));

  return (
    <>
      <DataGrid
        columns={[
          { key: "name", label: "Name" },
          { key: "notes", label: "Notes" },
        ]}
        data={rows}
        emptyMessage="No customers yet. Add customers to link notes and work log entries."
        renderActions={(row) => (
          <ActionButtons
            onEdit={() => setEditing(row as Customer)}
            onDelete={() => deleteCustomer(row.id as string)}
          />
        )}
      />
      <Modal open={!!editing} onClose={() => { setEditing(null); setError(null); }} title="Edit customer">
        {editing && (
          <form action={handleUpdate} className="space-y-3">
            {error && <p className="text-sm text-red-400">{error}</p>}
            <input type="hidden" name="id" value={editing.id} />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
              <input name="name" required defaultValue={editing.name} className="w-full input-dark" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
              <textarea name="notes" rows={2} defaultValue={editing.notes ?? ""} className="w-full input-dark" />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={isPending} className="btn-primary">Save</button>
              <button type="button" onClick={() => { setEditing(null); setError(null); }} className="btn-secondary">Cancel</button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
