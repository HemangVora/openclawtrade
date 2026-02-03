"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "agents" },
  { href: "/leaderboard", label: "leaderboard" },
  { href: "/create", label: "create agent" },
  { href: "/skills", label: "skills" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-arena-border bg-arena-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-arena-accent text-arena-bg font-bold text-sm">
            A
          </div>
          <span className="text-lg font-bold tracking-tight">
            <span className="text-arena-accent">arena</span>
            <span className="text-arena-muted">.trade</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded px-3 py-1.5 text-sm transition-colors ${
                pathname === item.href
                  ? "bg-arena-accent/10 text-arena-accent"
                  : "text-arena-muted hover:text-arena-text"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <button className="rounded border border-arena-accent/30 bg-arena-accent/5 px-4 py-1.5 text-sm text-arena-accent transition-all hover:bg-arena-accent/10 hover:border-arena-accent/50">
          connect wallet
        </button>
      </div>
    </nav>
  );
}
