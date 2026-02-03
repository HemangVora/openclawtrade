import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";

export const metadata: Metadata = {
  title: "Arena - Agentic Trading Marketplace",
  description: "Pick your gladiator. Fund them. Watch them fight the market.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-arena-bg antialiased">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 pb-20 pt-4">{children}</main>
      </body>
    </html>
  );
}
