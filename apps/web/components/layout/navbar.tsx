"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePrivy, useLogin, useLogout } from "@privy-io/react-auth";
import { usePrivyReady } from "@/components/providers/privy-provider";

const NAV_ITEMS = [
  { href: "/", label: "agents" },
  { href: "/leaderboard", label: "leaderboard" },
  { href: "/create", label: "create agent" },
  { href: "/skills", label: "skills" },
];

function truncateAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function PrivyWalletButton() {
  const { ready, authenticated, user } = usePrivy();
  const { login } = useLogin();
  const { logout } = useLogout();

  const walletAddress = user?.wallet?.address;

  if (!ready) {
    return (
      <button
        disabled
        className="rounded border border-arena-border bg-arena-card px-4 py-1.5 text-sm text-arena-muted"
      >
        loading...
      </button>
    );
  }

  if (authenticated && walletAddress) {
    return (
      <div className="flex items-center gap-2">
        <span className="rounded bg-arena-accent/10 px-3 py-1.5 text-sm font-mono text-arena-accent">
          {truncateAddress(walletAddress)}
        </span>
        <button
          onClick={logout}
          className="rounded border border-arena-red/30 bg-arena-red/5 px-3 py-1.5 text-sm text-arena-red transition-all hover:bg-arena-red/10 hover:border-arena-red/50"
        >
          disconnect
        </button>
      </div>
    );
  }

  if (authenticated) {
    return (
      <div className="flex items-center gap-2">
        <span className="rounded bg-arena-accent/10 px-3 py-1.5 text-sm text-arena-accent">
          connected
        </span>
        <button
          onClick={logout}
          className="rounded border border-arena-red/30 bg-arena-red/5 px-3 py-1.5 text-sm text-arena-red transition-all hover:bg-arena-red/10 hover:border-arena-red/50"
        >
          disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      className="rounded border border-arena-accent/30 bg-arena-accent/5 px-4 py-1.5 text-sm text-arena-accent transition-all hover:bg-arena-accent/10 hover:border-arena-accent/50"
    >
      connect wallet
    </button>
  );
}

function WalletButton() {
  const privyConfigured = usePrivyReady();

  if (!privyConfigured) {
    return (
      <button
        disabled
        className="rounded border border-arena-border bg-arena-card px-4 py-1.5 text-sm text-arena-muted cursor-not-allowed"
      >
        connect wallet
      </button>
    );
  }

  return <PrivyWalletButton />;
}

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

        <WalletButton />
      </div>
    </nav>
  );
}
