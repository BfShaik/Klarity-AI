"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DataGrid } from "@/components/ui/DataGrid";
import { ActionButtons } from "@/components/ui/ActionButtons";
import { Modal } from "@/components/ui/Modal";
import { updateLearningItem, deleteLearningItem } from "./actions";

type LearningItem = {
  id: string;
  title: string;
  source: string;
  external_url: string | null;
  progress_percent: number;
};

export default function LearningTable({ items }: { items: LearningItem[] }) {
  const [editing, setEditing] = useState<LearningItem | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleUpdate(formData: FormData) {
    if (!editing) return;
    setError(null);
    startTransition(async () => {
      try {
        await updateLearningItem(editing.id, formData);
        setEditing(null);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not update.");
      }
    });
  }

  const rows = items.map((i) => ({ ...i, id: i.id }));

  return (
    <>
      <DataGrid
        columns={[
          { key: "title", label: "Title" },
          { key: "source", label: "Source" },
          {
            key: "progress_percent",
            label: "Progress",
            render: (row) => (
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-[80px] h-2 bg-[#3d4152] rounded overflow-hidden">
                  <div className="h-full bg-[var(--accent-red)]" style={{ width: `${Number(row.progress_percent) ?? 0}%` }} />
                </div>
                <span className="text-sm tabular-nums">{Number(row.progress_percent) ?? 0}%</span>
              </div>
            ),
          },
        ]}
        data={rows}
        emptyMessage="No learning items yet. Add courses or learning paths."
        renderActions={(row) => (
          <ActionButtons
            onEdit={() => setEditing(row as LearningItem)}
            onDelete={() => deleteLearningItem(row.id as string)}
          />
        )}
      />
      <Modal open={!!editing} onClose={() => { setEditing(null); setError(null); }} title="Edit learning item">
        {editing && (
          <form action={handleUpdate} className="space-y-3">
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
              <input name="title" required defaultValue={editing.title} className="w-full input-dark" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Source</label>
              <input name="source" required defaultValue={editing.source} className="w-full input-dark" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">URL (optional)</label>
              <input name="external_url" type="url" defaultValue={editing.external_url ?? ""} className="w-full input-dark" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Progress %</label>
              <input name="progress_percent" type="number" min={0} max={100} defaultValue={editing.progress_percent} className="w-24 input-dark" />
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
