"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Search as SearchIcon, FileText, ClipboardList, Loader2, Users, Calendar, Trophy } from "lucide-react";

type NoteResult = { id: string; title: string; body: string | null };
type WorkLogResult = { id: string; date: string; summary: string };
type CustomerResult = { id: string; name: string; notes?: string | null };
type PlanResult = { id: string; date: string; content?: string | null; notes?: string | null };
type AchievementResult = { id: string; type: string; custom_title: string | null; custom_description?: string | null; earned_at: string };

type SearchResults = {
  notes: NoteResult[];
  workLogs: WorkLogResult[];
  customers: CustomerResult[];
  plans?: PlanResult[];
  achievements?: AchievementResult[];
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async () => {
    const q = query.trim();
    if (!q) {
      setResults({ notes: [], workLogs: [], customers: [], plans: [], achievements: [] });
      setSearched(true);
      return;
    }
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Search failed");
        setResults({ notes: [], workLogs: [], customers: [], plans: [], achievements: [] });
        return;
      }
      setResults(data.results ?? { notes: [], workLogs: [], customers: [], plans: [], achievements: [] });
    } catch {
      setError("Search failed. Please try again.");
      setResults({ notes: [], workLogs: [], customers: [], plans: [], achievements: [] });
    } finally {
      setLoading(false);
    }
  }, [query]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    doSearch();
  }

  const plans = results?.plans ?? [];
  const achievements = results?.achievements ?? [];
  const hasResults = results && (results.notes.length > 0 || results.workLogs.length > 0 || results.customers.length > 0 || plans.length > 0 || achievements.length > 0);
  const noResults = searched && results && results.notes.length === 0 && results.workLogs.length === 0 && results.customers.length === 0 && plans.length === 0 && achievements.length === 0 && !loading;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-white">Search</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl mb-8">
        <div className="relative">
          <SearchIcon
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes, work log, customers, plans, achievements…"
            className="w-full pl-12 pr-4 py-3 rounded-xl input-dark text-white placeholder:text-slate-500 focus:ring-2 focus:ring-[var(--accent-red)] focus:border-transparent"
            autoFocus
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 btn-primary py-1.5 px-4 text-sm"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Search"}
          </button>
        </div>
      </form>

      {error && (
        <p className="text-red-400 mb-4">{error}</p>
      )}

      {noResults && query.trim() && (
        <p className="text-slate-400 py-8">No results found for &ldquo;{query.trim()}&rdquo;</p>
      )}

      {hasResults && (
        <div className="space-y-8">
          {results!.customers.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
                <Users size={20} className="text-blue-400" />
                Customers ({results!.customers.length})
              </h2>
              <div className="space-y-3">
                {results!.customers.map((c) => (
                  <Link
                    key={c.id}
                    href="/customers"
                    className="block card-bg p-4 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <div className="font-medium text-red-400 hover:text-red-300">
                      {c.name}
                    </div>
                    {c.notes && (
                      <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                        {c.notes}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results!.notes.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
                <FileText size={20} className="text-emerald-400" />
                Notes ({results!.notes.length})
              </h2>
              <div className="space-y-3">
                {results!.notes.map((n) => (
                  <Link
                    key={n.id}
                    href={`/notes/${n.id}`}
                    className="block card-bg p-4 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <div className="font-medium text-red-400 hover:text-red-300">
                      {n.title}
                    </div>
                    {n.body && (
                      <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                        {n.body}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {plans.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
                <Calendar size={20} className="text-blue-400" />
                Plans ({plans.length})
              </h2>
              <div className="space-y-3">
                {plans.map((p) => (
                  <Link
                    key={p.id}
                    href="/planner"
                    className="block card-bg p-4 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <div className="text-sm text-slate-400">{p.date}</div>
                    <div className="text-slate-200 mt-1">
                      {(p.content || p.notes || "").slice(0, 120)}
                      {((p.content?.length ?? 0) + (p.notes?.length ?? 0)) > 120 ? "…" : ""}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {achievements.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
                <Trophy size={20} className="text-amber-400" />
                Achievements ({achievements.length})
              </h2>
              <div className="space-y-3">
                {achievements.map((a) => (
                  <Link
                    key={a.id}
                    href={`/achievements/${a.id}`}
                    className="block card-bg p-4 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <div className="font-medium text-red-400 hover:text-red-300">
                      {a.custom_title || a.type}
                    </div>
                    <div className="text-sm text-slate-400">{a.earned_at} · {a.type}</div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results!.workLogs.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
                <ClipboardList size={20} className="text-amber-400" />
                Work log ({results!.workLogs.length})
              </h2>
              <div className="space-y-3">
                {results!.workLogs.map((w) => (
                  <Link
                    key={w.id}
                    href="/work-log"
                    className="block card-bg p-4 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <div className="text-sm text-slate-400">{w.date}</div>
                    <div className="text-slate-200 mt-1">{w.summary}</div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {!searched && (
        <p className="text-slate-500 text-sm">Enter a search term to find notes, work log, customers, plans, and achievements.</p>
      )}
    </div>
  );
}
