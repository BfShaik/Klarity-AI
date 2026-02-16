import { ReactNode } from "react";

export type Column = {
  key: string;
  label: string;
  className?: string;
  render?: (row: Record<string, unknown>) => ReactNode;
};

type DataGridProps = {
  columns: Column[];
  data: Array<Record<string, unknown> & { id: string }>;
  renderActions?: (row: Record<string, unknown> & { id: string }) => ReactNode;
  emptyMessage?: string;
};

export function DataGrid(props: DataGridProps) {
  const { columns, data, renderActions, emptyMessage = "No data yet." } = props;
  if (!data?.length) {
    return (
      <p className="text-slate-400 py-6 text-center rounded-lg card-bg px-4">
        {emptyMessage}
      </p>
    );
  }
  return (
    <div className="overflow-x-auto card-bg">
      <table className="min-w-full divide-y" style={{ borderColor: "var(--border-dark)" }}>
        <thead>
          <tr style={{ backgroundColor: "var(--bg-panel)" }}>
            {columns.map((col) => (
              <th key={col.key} scope="col" className={"px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider " + (col.className || "")}>
                {col.label}
              </th>
            ))}
            {renderActions ? (
              <th scope="col" className="px-5 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider w-32">Actions</th>
            ) : null}
          </tr>
        </thead>
        <tbody className="divide-y" style={{ borderColor: "var(--border-dark)" }}>
          {data.map((row) => (
            <tr key={String(row.id)} className="hover:bg-white/5 transition-colors" style={{ backgroundColor: "var(--bg-card)" }}>
              {columns.map((col) => (
                <td key={col.key} className={"px-5 py-3 text-sm text-slate-200 " + (col.className || "")}>
                  {col.render ? col.render(row) : String(row[col.key] ?? "")}
                </td>
              ))}
              {renderActions ? <td className="px-5 py-3 text-right">{renderActions(row as Record<string, unknown> & { id: string })}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
