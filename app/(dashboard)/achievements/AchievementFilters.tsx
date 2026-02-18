"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const TYPES = [
  { value: "", label: "All types" },
  { value: "certification", label: "Certification" },
  { value: "badge", label: "Badge" },
  { value: "milestone", label: "Milestone" },
];

export default function AchievementFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const type = searchParams.get("type") ?? "";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const newType = (fd.get("type") as string)?.trim() || "";
    const newFrom = (fd.get("from") as string)?.trim() || "";
    const newTo = (fd.get("to") as string)?.trim() || "";
    const params = new URLSearchParams();
    if (newType) params.set("type", newType);
    if (newFrom) params.set("from", newFrom);
    if (newTo) params.set("to", newTo);
    startTransition(() => {
      router.push(params.toString() ? `/achievements?${params}` : "/achievements");
    });
  }

  function handleClear() {
    startTransition(() => router.push("/achievements"));
  }

  const hasFilters = type || from || to;

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 mb-4">
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">Type</label>
        <select
          name="type"
          defaultValue={type}
          className="input-dark py-1.5 px-2 text-sm min-w-[120px]"
        >
          {TYPES.map((t) => (
            <option key={t.value || "all"} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
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
      <button type="submit" disabled={isPending} className="btn-secondary py-1.5 px-3 text-sm">
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
