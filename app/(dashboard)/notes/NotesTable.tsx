"use client";

import Link from "next/link";
import { DataGrid } from "@/components/ui/DataGrid";
import { ActionButtons } from "@/components/ui/ActionButtons";
import { deleteNote } from "./actions";

type Note = { id: string; title: string; created_at: string; customer_id?: string | null };
type Customer = { id: string; name: string };

export default function NotesTable({ notes, customers }: { notes: Note[]; customers: Customer[] }) {
  const customerMap: Record<string, string> = Object.fromEntries(customers.map((c) => [c.id, c.name]));
  const rows = notes.map((n) => ({
    id: n.id,
    title: n.title,
    created_at: new Date(n.created_at).toLocaleDateString(),
    customer_id: n.customer_id,
  }));

  return (
    <DataGrid
      columns={[
        {
          key: "title",
          label: "Title",
          render: (row) => (
            <Link href={`/notes/${row.id}`} className="font-medium text-red-400 hover:text-red-300">
              {String(row.title)}
            </Link>
          ),
        },
        ...(customers.length > 0
          ? [
              {
                key: "customer_id",
                label: "Customer",
                render: (row: { customer_id?: string }) => {
                  const cid = row.customer_id;
                  return (cid && customerMap[cid]) ? customerMap[cid] : "—";
                },
              } as const,
            ]
          : []),
        { key: "created_at", label: "Date" },
      ]}
      data={rows}
      emptyMessage="No notes yet. Create a note or use voice-to-text."
      renderActions={(row) => (
        <div className="flex items-center justify-end gap-2">
          <Link href={`/notes/${row.id}`} className="btn-secondary py-1.5 px-3 text-sm">
            Edit
          </Link>
          <ActionButtons onDelete={() => deleteNote(row.id as string)} />
        </div>
      )}
    />
  );
}
