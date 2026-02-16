"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

type ActionButtonsProps = {
  onDelete: () => Promise<unknown>;
  onEdit?: () => void;
  deleteLabel?: string;
  editLabel?: string;
};

export function ActionButtons({
  onDelete,
  onEdit,
  deleteLabel = "Delete",
  editLabel = "Edit",
}: ActionButtonsProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm("Are you sure you want to delete this?")) return;
    startTransition(async () => {
      try {
        await onDelete();
        router.refresh();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Could not delete.";
        alert(msg);
      }
    });
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="btn-secondary py-1.5 px-3 text-sm"
        >
          {editLabel}
        </button>
      )}
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="btn-danger py-1.5 px-3 text-sm"
      >
        {isPending ? "…" : deleteLabel}
      </button>
    </div>
  );
}
