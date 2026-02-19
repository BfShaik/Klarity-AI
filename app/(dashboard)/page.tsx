import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Suspense } from "react";
import {
  ClipboardList,
  StickyNote,
  Calendar,
  BookOpen,
  Trophy,
  Target,
  FileText,
  Activity,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import dynamic from "next/dynamic";
import { PeriodSelector } from "./components/DashboardClient";

const WorkLogActivityChart = dynamic(
  () => import("./components/DashboardCharts").then((m) => ({ default: m.WorkLogActivityChart })),
  { ssr: true, loading: () => <div className="h-[180px] bg-white/5 animate-pulse rounded" /> }
);

const GoalsProgressChart = dynamic(
  () => import("./components/DashboardCharts").then((m) => ({ default: m.GoalsProgressChart })),
  { ssr: true, loading: () => <div className="h-[180px] bg-white/5 animate-pulse rounded" /> }
);

async function getCounts(supabase: Awaited<ReturnType<typeof createClient>>) {
  try {
    const [
      { count: achievementsCount },
      { count: goalsCount },
      { count: completedGoalsCount },
      { count: notesCount },
      { count: workLogsCount },
    ] = await Promise.all([
      supabase.from("achievements").select("id", { count: "exact", head: true }),
      supabase.from("goals").select("id", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("goals").select("id", { count: "exact", head: true }).eq("status", "completed"),
      supabase.from("notes").select("id", { count: "exact", head: true }),
      supabase.from("work_logs").select("id", { count: "exact", head: true }),
    ]);
    return {
      achievements: achievementsCount ?? 0,
      goals: goalsCount ?? 0,
      completedGoals: completedGoalsCount ?? 0,
      notes: notesCount ?? 0,
      workLogs: workLogsCount ?? 0,
    };
  } catch {
    return { achievements: 0, goals: 0, completedGoals: 0, notes: 0, workLogs: 0 };
  }
}

type Period = "week" | "month" | "all";

async function getWorkLogChartData(
  supabase: Awaited<ReturnType<typeof createClient>>,
  period: Period = "week"
) {
  try {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    const startDate = new Date(today);

    if (period === "week") {
      startDate.setDate(startDate.getDate() - 6);
    } else if (period === "month") {
      startDate.setDate(startDate.getDate() - 29);
    } else {
      startDate.setDate(startDate.getDate() - 89); // ~90 days for "all"
    }

    const { data } = await supabase
      .from("work_logs")
      .select("date")
      .gte("date", startDate.toISOString().slice(0, 10))
      .lte("date", today.toISOString().slice(0, 10));

    const dayCount = period === "week" ? 7 : period === "month" ? 30 : 90;
    const byDay: Record<string, number> = {};
    for (let i = 0; i < dayCount; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      byDay[d.toISOString().slice(0, 10)] = 0;
    }
    (data ?? []).forEach((r) => {
      const key = (r as { date: string }).date;
      if (byDay[key] !== undefined) byDay[key]++;
    });

    return Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({
        day: dayNames[new Date(date).getDay()],
        count,
      }));
  } catch {
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => ({ day, count: 0 }));
  }
}

type SearchParams = { period?: string };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const period: Period =
    params.period === "month" || params.period === "all" ? params.period : "week";

  const supabase = await createClient();
  const [
    counts,
    workLogChartData,
    upcomingGoals,
    recentCompletions,
    { data: { user } },
  ] = await Promise.all([
    getCounts(supabase),
    getWorkLogChartData(supabase, period),
    supabase
      .from("goals")
      .select("id, title, target_date")
      .eq("status", "active")
      .order("target_date", { ascending: true, nullsFirst: false })
      .limit(5),
    supabase
      .from("goals")
      .select("id, title, target_date, completed_at")
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(5),
    supabase.auth.getUser(),
  ]);

  const { data: profile } = user
    ? await supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle()
    : { data: null };
  const greeting = profile?.display_name?.trim() || user?.email?.split("@")[0] || "there";

  const stats = [
    { label: "Achievements", value: counts.achievements, href: "/achievements", icon: Trophy, color: "text-red-400" },
    { label: "Active goals", value: counts.goals, href: "/goals", icon: Target, color: "text-blue-400" },
    { label: "Notes", value: counts.notes, href: "/notes", icon: FileText, color: "text-emerald-400" },
    { label: "Work log entries", value: counts.workLogs, href: "/work-log", icon: Activity, color: "text-amber-400" },
  ];

  return (
    <div>
      {/* Header: title, greeting, period selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome back, {greeting}!</p>
        </div>
        <Suspense fallback={null}>
          <PeriodSelector />
        </Suspense>
      </div>

      {/* Action buttons - colorful like HealthApp */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link
          href="/work-log"
          className="flex items-center gap-3 p-4 rounded-xl text-white font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--accent-red)" }}
        >
          <ClipboardList size={24} />
          <span>Add work log</span>
        </Link>
        <Link
          href="/notes/new"
          className="flex items-center gap-3 p-4 rounded-xl bg-emerald-600 text-white font-medium transition-opacity hover:opacity-90"
        >
          <StickyNote size={24} />
          <span>New note</span>
        </Link>
        <Link
          href="/planner"
          className="flex items-center gap-3 p-4 rounded-xl bg-blue-600 text-white font-medium transition-opacity hover:opacity-90"
        >
          <Calendar size={24} />
          <span>Open planner</span>
        </Link>
        <Link
          href="/learning"
          className="flex items-center gap-3 p-4 rounded-xl bg-violet-600 text-white font-medium transition-opacity hover:opacity-90"
        >
          <BookOpen size={24} />
          <span>Learning</span>
        </Link>
      </div>

      {/* Upcoming goals & Recent completions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card-bg p-5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Upcoming goals</h2>
            <Link href="/goals" className="text-sm text-slate-400 hover:text-white transition-colors">
              View all
            </Link>
          </div>
          {upcomingGoals.data && upcomingGoals.data.length > 0 ? (
            <ul className="space-y-2">
              {upcomingGoals.data.map((g) => (
                <li key={g.id}>
                  <Link
                    href="/goals"
                    className="block p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-200"
                  >
                    <span className="font-medium">{g.title}</span>
                    {g.target_date && (
                      <span className="text-slate-500 text-sm ml-2">— {g.target_date}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-sm">No upcoming goals. Add one on the Goals page.</p>
          )}
        </div>
        <div className="card-bg p-5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent completions</h2>
            <Link href="/goals" className="text-sm text-slate-400 hover:text-white transition-colors">
              View all
            </Link>
          </div>
          {recentCompletions.data && recentCompletions.data.length > 0 ? (
            <ul className="space-y-2">
              {recentCompletions.data.map((g) => (
                <li key={g.id}>
                  <Link
                    href="/goals"
                    className="block p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-200"
                  >
                    <span className="font-medium">{g.title}</span>
                    {g.completed_at && (
                      <span className="text-emerald-500/80 text-sm ml-2">
                        ✓ {new Date(g.completed_at).toLocaleDateString()}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-sm">No recently completed goals yet.</p>
          )}
        </div>
      </div>

      {/* Summary cards with icons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, href, icon: Icon, color }) => (
          <Link
            key={href}
            href={href}
            className="card-bg p-5 rounded-xl hover:bg-white/5 transition-colors flex justify-between items-start"
          >
            <div>
              <p className="text-sm text-slate-400">{label}</p>
              <p className="text-2xl font-semibold mt-1 text-white">{value}</p>
            </div>
            <Icon size={24} className={color} />
          </Link>
        ))}
      </div>

      {/* Chart cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-bg p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={20} className="text-white" />
            <h2 className="text-lg font-semibold text-white">
              Work log activity {period === "week" ? "(last 7 days)" : period === "month" ? "(last 30 days)" : "(last 90 days)"}
            </h2>
          </div>
          <WorkLogActivityChart data={workLogChartData} />
        </div>
        <div className="card-bg p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-white" />
            <h2 className="text-lg font-semibold text-white">Goals progress</h2>
          </div>
          <GoalsProgressChart activeGoals={counts.goals} completedGoals={counts.completedGoals} />
        </div>
      </div>
    </div>
  );
}
