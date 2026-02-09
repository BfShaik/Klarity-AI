import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

async function getCounts(supabase: Awaited<ReturnType<typeof createClient>>) {
  try {
    const [
      { count: achievementsCount },
      { count: goalsCount },
      { count: notesCount },
      { count: workLogsCount },
    ] = await Promise.all([
      supabase.from("achievements").select("*", { count: "exact", head: true }),
      supabase.from("goals").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("notes").select("*", { count: "exact", head: true }),
      supabase.from("work_logs").select("*", { count: "exact", head: true }),
    ]);
    return {
      achievements: achievementsCount ?? 0,
      goals: goalsCount ?? 0,
      notes: notesCount ?? 0,
      workLogs: workLogsCount ?? 0,
    };
  } catch {
    return { achievements: 0, goals: 0, notes: 0, workLogs: 0 };
  }
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const counts = await getCounts(supabase);

  const stats = [
    { label: "Achievements", value: counts.achievements, href: "/achievements" },
    { label: "Active goals", value: counts.goals, href: "/goals" },
    { label: "Notes", value: counts.notes, href: "/notes" },
    { label: "Work log entries", value: counts.workLogs, href: "/work-log" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, href }) => (
          <Link
            key={href}
            href={href}
            className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
          >
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-2xl font-semibold mt-1">{value}</p>
          </Link>
        ))}
      </div>
      <p className="text-gray-600">
        Use the sidebar to open Achievements, Notes, Planner, Work log, and Reviews.
      </p>
    </div>
  );
}
