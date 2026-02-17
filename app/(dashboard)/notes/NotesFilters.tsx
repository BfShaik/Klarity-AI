"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type Customer = { id: string; name: string };

export default function NotesFilters({ customers }: { customers: Customer[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const customerId = searchParams.get("customer_id") ?? "";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const newCustomerId = (fd.get("customer_id") as string)?.trim() || "";
    const newFrom = (fd.get("from") as string)?.trim() || "";
    const newTo = (fd.get("to") as string)?.trim() || "";
    const params = new URLSearchParams();
    if (newCustomerId) params.set("customer_id", newCustomerId);
    if (newFrom) params.set("from", newFrom);
    if (newTo) params.set("to", newTo);
    startTransition(() => {
      router.push(params.toString() ? `/notes?${params}` : "/notes");
    });
  }

  function handleClear() {
    startTransition(() => router.push("/notes"));
  }

  const hasFilters = customerId || from || to;

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 mb-4">
      {customers.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Customer</label>
          <select
            name="customer_id"
            defaultValue={customerId}
            className="input-dark py-1.5 px-2 text-sm min-w-[140px]"
          >
            <option value="">All</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">From</label>
        <input
          name="from"
          type="date"
          defaultValue={from}
          className="input-dark py-1.5 px-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">To</label>
        <input
          name="to"
          type="date"
          defaultValue={to}
          className="input-dark py-1.5 px-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="btn-secondary py-1.5 px-3 text-sm"
      >
        Filter
      </button>
      {hasFilters && (
        <button
          type="button"
          onClick={handleClear}
          disabled={isPending}
          className="btn-secondary py-1.5 px-3 text-sm opacity-80 hover:opacity-100"
        >
          Clear
        </button>
      )}
    </form>
  );
}
