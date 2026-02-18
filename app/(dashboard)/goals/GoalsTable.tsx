"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DataGrid } from "@/components/ui/DataGrid";
import { ActionButtons } from "@/components/ui/ActionButtons";
import { Modal } from "@/components/ui/Modal";
import { updateGoal, deleteGoal } from "./actions";

type Goal = { id: string; title: string; target_date: string | null; status: string; linked_certification_id?: string | null };
type Certification = { id: string; name: string };

export default function GoalsTable({ goals, certifications }: { goals: Goal[]; certifications: Certification[] }) {
  const certMap: Record<string, string> = Object.fromEntries(certifications.map((c) => [c.id, c.name]));
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

  const rows = goals.map((g) => ({ ...g, id: g.id, linked_certification_id: g.linked_certification_id }));

  return (
    <>
      <DataGrid
        columns={[
          { key: "title", label: "Title" },
          ...(certifications.length > 0
            ? [{
                key: "linked_certification_id",
                label: "Certification",
                render: (row: { linked_certification_id?: string }) => {
                  const cid = row.linked_certification_id;
                  return (cid && certMap[cid]) ? certMap[cid] : "—";
                },
              } as const]
            : []),
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
            {certifications.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Link to certification</label>
                <select
                  name="linked_certification_id"
                  defaultValue={editing.linked_certification_id ?? ""}
                  className="w-full input-dark"
                >
                  <option value="">— None —</option>
                  {certifications.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
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
