"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DataGrid } from "@/components/ui/DataGrid";
import { ActionButtons } from "@/components/ui/ActionButtons";
import { Modal } from "@/components/ui/Modal";
import { updateGoal, deleteGoal } from "./actions";

type Goal = { id: string; title: string; target_date: string | null; status: string };

export default function GoalsTable({ goals }: { goals: Goal[] }) {
  const [editing, setEditing] = useState<Goal | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleUpdate(formData: FormData) {
    if (!editing) return;
    setError(null);
    startTransition(async () => {
      try {
        await updateGoal(editing.id, formData);
        setEditing(null);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not update.");
      }
    });
  }

  const rows = goals.map((g) => ({ ...g, id: g.id }));

  return (
    <>
      <DataGrid
        columns={[
          { key: "title", label: "Title" },
          {
            key: "target_date",
            label: "Target date",
            render: (row) => (row.target_date ? String(row.target_date) : "—"),
          },
          {
            key: "status",
            label: "Status",
            render: (row) => (
              <span
                className={
                  row.status === "completed"
                    ? "text-emerald-400"
                    : row.status === "cancelled"
                    ? "text-slate-400"
                    : "text-blue-400"
                }
              >
                {String(row.status)}
              </span>
            ),
          },
        ]}
        data={rows}
        emptyMessage="No goals yet. Add a goal to track progress."
        renderActions={(row) => (
          <ActionButtons
            onEdit={() => setEditing(row as Goal)}
            onDelete={() => deleteGoal(row.id as string)}
          />
        )}
      />
      <Modal open={!!editing} onClose={() => { setEditing(null); setError(null); }} title="Edit goal">
        {editing && (
          <form action={handleUpdate} className="space-y-3">
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
              <input name="title" required defaultValue={editing.title} className="w-full input-dark" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Target date</label>
              <input name="target_date" type="date" defaultValue={editing.target_date ?? ""} className="w-full input-dark" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
              <select name="status" defaultValue={editing.status} className="w-full input-dark">
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
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
