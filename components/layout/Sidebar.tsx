"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Trophy,
  Award,
  BadgeCheck,
  BookOpen,
  Target,
  Users,
  StickyNote,
  Calendar,
  ClipboardList,
  FileBarChart,
  Settings,
} from "lucide-react";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/search", label: "Search", icon: Search },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/certifications", label: "Certifications", icon: Award },
  { href: "/badges", label: "Badges", icon: BadgeCheck },
  { href: "/learning", label: "Learning", icon: BookOpen },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/planner", label: "Planner", icon: Calendar },
  { href: "/work-log", label: "Work log", icon: ClipboardList },
  { href: "/reviews", label: "Reviews", icon: FileBarChart },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside
      className="w-64 min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--bg-sidebar)" }}
    >
      {/* Header with logo and collapse toggle */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-700/50">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--accent-red)" }}>
          <LayoutDashboard className="text-white" size={24} />
        </div>
        <span className="text-xl font-bold text-white">Klarity AI</span>
      </div>

      {/* Nav items - red pill active state extends to left edge like HealthApp */}
      <nav className="flex-1 p-4 pt-4 space-y-1 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 py-3 pl-4 pr-4 -ml-4 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[var(--accent-red)] text-white rounded-r-lg"
                  : "text-white hover:bg-white/10 rounded-r-lg"
              }`}
            >
              <Icon size={20} className="shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
