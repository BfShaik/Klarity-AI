"use client";

import { useState } from "react";
import { Download } from "lucide-react";

const TABLES = [
  { value: "work_logs", label: "Work log" },
  { value: "goals", label: "Goals" },
  { value: "notes", label: "Notes" },
  { value: "achievements", label: "Achievements" },
  { value: "learning_progress", label: "Learning" },
  { value: "customers", label: "Customers" },
  { value: "daily_plans", label: "Plans" },
  { value: "review_entries", label: "Review entries" },
];

export default function ExportSection() {
  const [csvTable, setCsvTable] = useState("work_logs");
  const [loading, setLoading] = useState<"json" | "csv" | null>(null);

  function downloadJson() {
    setLoading("json");
    window.location.href = "/api/export?format=json";
    setTimeout(() => setLoading(null), 1000);
  }

  function downloadCsv() {
    setLoading("csv");
    window.location.href = `/api/export?format=csv&table=${csvTable}`;
    setTimeout(() => setLoading(null), 1000);
  }

  return (
    <div className="card-bg p-5 rounded-xl mt-6">
      <h2 className="font-semibold text-white mb-3">Export data</h2>
      <p className="text-sm text-slate-400 mb-4">
        Download your data as JSON (all tables) or CSV (single table).
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={downloadJson}
          disabled={!!loading}
          className="btn-secondary flex items-center gap-2"
        >
          <Download size={16} />
          {loading === "json" ? "Downloading…" : "Download JSON"}
        </button>
        <div className="flex items-center gap-2">
          <select
            value={csvTable}
            onChange={(e) => setCsvTable(e.target.value)}
            className="input-dark py-2 px-3 text-sm min-w-[140px]"
          >
            {TABLES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={downloadCsv}
            disabled={!!loading}
            className="btn-secondary flex items-center gap-2"
          >
            <Download size={16} />
            {loading === "csv" ? "Downloading…" : "Download CSV"}
          </button>
        </div>
      </div>
    </div>
  );
}
