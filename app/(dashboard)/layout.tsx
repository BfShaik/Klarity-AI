import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { ChatBot } from "@/components/chat/ChatBot";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen page-bg" style={{ backgroundColor: "var(--bg-main)" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col" style={{ backgroundColor: "var(--bg-main)" }}>
        <Header />
        <main className="flex-1 p-6" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-primary)" }} data-dashboard>{children}</main>
        <ChatBot />
      </div>
    </div>
  );
}
