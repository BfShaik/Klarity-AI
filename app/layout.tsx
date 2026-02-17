import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Klarity AI",
  description: "Personal work ledger — track your work, plan your days, and generate manager reviews.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning style={{ backgroundColor: "#1a1b2c" }}>
      <body
        className="font-sans antialiased min-h-screen"
        style={{ backgroundColor: "#1a1b2c", color: "#f8fafc", fontFamily: "ui-sans-serif, system-ui, Inter, sans-serif" }}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
