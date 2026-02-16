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
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen" style={{ backgroundColor: "var(--bg-main)" }} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
