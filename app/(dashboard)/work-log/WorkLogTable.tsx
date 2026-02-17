"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DataGrid } from "@/components/ui/DataGrid";
import { ActionButtons } from "@/components/ui/ActionButtons";
import { Modal } from "@/components/ui/Modal";
import { updateWorkLog, deleteWorkLog } from "./actions";

type WorkLogEntry = { id: string; date: string; summary: string; minutes: number | null; customer_id: string | null };
type Customer = { id: string; name: string };

export default function WorkLogTable({ entries, customers }: { entries: WorkLogEntry[]; customers: Customer[] }) {
  const customerMap: Record<string, string> = Object.fromEntries(customers.map((c) => [c.id, c.name]));
  const [editing, setEditing] = useState<WorkLogEntry | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleUpdate(formData: FormData) {
    if (!editing) return;
    setError(null);
    startTransition(async () => {
      try {
        await updateWorkLog(editing.id, formData);
        setEditing(null);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not update.");
      }
    });
  }

  const rows = entries.map((e) => ({ ...e, id: e.id }));

  return (
    <>
      <DataGrid
        columns={[
          { key: "date", label: "Date" },
          { key: "summary", label: "Summary" },
          {
            key: "customer_id",
            label: "Customer",
            render: (row) => {
              const cid = row.customer_id as string | undefined;
              return (cid && customerMap[cid]) ? customerMap[cid] : "—";
            },
          },
          {
            key: "minutes",
            label: "Minutes",
            render: (row) => (row.minutes != null ? `${row.minutes}` : "—"),
          },
        ]}
        data={rows}
        emptyMessage="No work log entries yet."
        renderActions={(row) => (
          <ActionButtons
            onEdit={() => setEditing(row as WorkLogEntry)}
            onDelete={() => deleteWorkLog(row.id as string)}
          />
        )}
      />
      <Modal open={!!editing} onClose={() => { setEditing(null); setError(null); }} title="Edit work log entry" size="lg">
        {editing && (
          <form action={handleUpdate} className="space-y-3">
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Date</label>
              <input name="date" type="date" required defaultValue={editing.date} className="w-full input-dark" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Summary</label>
              <input name="summary" required defaultValue={editing.summary} className="w-full input-dark" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Minutes (optional)</label>
              <input name="minutes" type="number" min={0} defaultValue={editing.minutes ?? ""} className="w-24 input-dark" />
            </div>
            {customers.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Customer</label>
                <select name="customer_id" defaultValue={editing.customer_id ?? ""} className="w-full input-dark">
                  <option value="">— None —</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
