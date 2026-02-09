import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Klarity AI",
  description: "Personal work ledger — track your work, plan your days, and generate manager reviews.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">{children}</body>
    </html>
  );
}
