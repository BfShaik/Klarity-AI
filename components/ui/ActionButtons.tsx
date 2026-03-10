"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toUserMessage } from "@/lib/errors";

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
        alert(toUserMessage(err));
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
