import Link from "next/link";

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/achievements", label: "Achievements" },
  { href: "/certifications", label: "Certifications" },
  { href: "/badges", label: "Badges" },
  { href: "/learning", label: "Learning" },
  { href: "/goals", label: "Goals" },
  { href: "/customers", label: "Customers" },
  { href: "/notes", label: "Notes" },
  { href: "/planner", label: "Planner" },
  { href: "/work-log", label: "Work log" },
  { href: "/reviews", label: "Reviews" },
  { href: "/settings", label: "Settings" },
];

export function Sidebar() {
  return (
    <aside className="w-56 border-r border-gray-200 bg-gray-50 min-h-screen p-4">
      <nav className="space-y-1">
        {nav.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="block rounded px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
