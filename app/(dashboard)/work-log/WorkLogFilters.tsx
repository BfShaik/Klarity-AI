"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export default function WorkLogFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const newFrom = (fd.get("from") as string)?.trim() || "";
    const newTo = (fd.get("to") as string)?.trim() || "";
    const params = new URLSearchParams();
    if (newFrom) params.set("from", newFrom);
    if (newTo) params.set("to", newTo);
    startTransition(() => {
      router.push(params.toString() ? `/work-log?${params}` : "/work-log");
    });
  }

  function handleClear() {
    startTransition(() => router.push("/work-log"));
  }

  const hasFilters = from || to;

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 mb-4">
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
