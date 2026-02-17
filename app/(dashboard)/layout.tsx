import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen page-bg" style={{ backgroundColor: "#1a1b2c" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col" style={{ backgroundColor: "#1a1b2c" }}>
        <Header />
        <main className="flex-1 p-6 text-slate-100" style={{ backgroundColor: "#1a1b2c", color: "#f8fafc" }} data-dashboard>{children}</main>
      </div>
    </div>
  );
}
