"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { AgentCard } from "@/components/agents/agent-card";
import {
  Activity,
  TrendingUp,
  Users,
  Wallet,
  Swords,
  Plus,
  Zap,
  SearchX,
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  description: string;
  creator: string;
  strategy: string;
  skills: string[];
  status: "live" | "stopped" | "error" | "deploying";
  verified: boolean;
  stats: {
    pnl: number;
    pnlPct: number;
    winRate: number;
    trades: number;
    aum: number;
    investors: number;
    maxDrawdown: number;
  };
}

interface AgentMarketplaceProps {
  agents: Agent[];
  totalAum: number;
  totalAgents: number;
}

const STRATEGIES = ["all", "momentum", "sentiment", "arbitrage", "degen", "conservative"];

type SortOption = "pnl" | "aum" | "winRate" | "newest";

export function AgentMarketplace({ agents, totalAum, totalAgents }: AgentMarketplaceProps) {
  const [activeStrategy, setActiveStrategy] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("pnl");

  const filteredAndSorted = useMemo(() => {
    let result = [...agents];

    // Filter by strategy
    if (activeStrategy !== "all") {
      result = result.filter((a) => a.strategy === activeStrategy);
    }

    // Sort
    switch (sortBy) {
      case "pnl":
        result.sort((a, b) => b.stats.pnl - a.stats.pnl);
        break;
      case "aum":
        result.sort((a, b) => b.stats.aum - a.stats.aum);
        break;
      case "winRate":
        result.sort((a, b) => b.stats.winRate - a.stats.winRate);
        break;
      case "newest":
        // Newest first -- IDs are sequential, so higher ID = newer
        result.sort((a, b) => Number(b.id) - Number(a.id));
        break;
    }

    return result;
  }, [agents, activeStrategy, sortBy]);

  // Compute average PnL for agents with positive performance
  const avgPnl = useMemo(() => {
    if (agents.length === 0) return 0;
    const total = agents.reduce((sum, a) => sum + a.stats.pnlPct, 0);
    return total / agents.length;
  }, [agents]);

  const totalInvestors = useMemo(() => {
    return agents.reduce((sum, a) => sum + a.stats.investors, 0);
  }, [agents]);

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative rounded-lg border border-arena-border bg-arena-card overflow-hidden">
        {/* Background grid pattern */}
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />

        {/* Gradient accent glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-arena-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-arena-accent/[0.03] rounded-full blur-3xl pointer-events-none" />

        <div className="relative p-8">
          <div className="flex items-start justify-between">
            <div>
              {/* Live indicator */}
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center gap-1.5 rounded-full bg-arena-accent/10 border border-arena-accent/20 px-3 py-1 text-[10px] text-arena-accent">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-arena-accent opacity-75 pulse-dot" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-arena-accent" />
                  </span>
                  LIVE ON SOLANA
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight">
                <span className="text-gradient-hero">arena</span>
                <span className="text-arena-muted">.trade</span>
              </h1>
              <p className="mt-3 text-arena-muted text-sm max-w-lg leading-relaxed">
                pick your gladiator. fund them. watch them fight the market.
                <br />
                <span className="text-arena-text/70">
                  autonomous trading agents powered by solana. you bring the capital, they bring the alpha.
                </span>
              </p>

              {/* Quick action buttons */}
              <div className="flex items-center gap-3 mt-5">
                <Link
                  href="/create"
                  className="group flex items-center gap-2 rounded-lg bg-arena-accent/10 border border-arena-accent/30 px-4 py-2 text-sm text-arena-accent transition-all hover:bg-arena-accent/15 hover:border-arena-accent/50"
                >
                  <Swords className="w-4 h-4" />
                  deploy agent
                </Link>
                <Link
                  href="/skills"
                  className="flex items-center gap-2 rounded-lg border border-arena-border px-4 py-2 text-sm text-arena-muted transition-all hover:border-arena-accent/20 hover:text-arena-text"
                >
                  <Zap className="w-4 h-4" />
                  browse skills
                </Link>
              </div>
            </div>

            {/* Stats panel - desktop */}
            <div className="hidden md:block">
              <div className="grid grid-cols-2 gap-3">
                <StatBox
                  icon={<Wallet className="w-3 h-3" />}
                  label="total aum"
                  value={totalAum > 0 ? totalAum.toLocaleString() : "---"}
                  sub="SOL locked"
                  accent
                />
                <StatBox
                  icon={<Activity className="w-3 h-3" />}
                  label="agents"
                  value={totalAgents > 0 ? String(totalAgents) : "---"}
                  sub="active now"
                />
                <StatBox
                  icon={<TrendingUp className="w-3 h-3" />}
                  label="avg pnl"
                  value={agents.length > 0 ? `${avgPnl > 0 ? "+" : ""}${avgPnl.toFixed(1)}%` : "---"}
                  sub="30d average"
                  accent={avgPnl > 0}
                />
                <StatBox
                  icon={<Users className="w-3 h-3" />}
                  label="investors"
                  value={totalInvestors > 0 ? totalInvestors.toLocaleString() : "---"}
                  sub="total users"
                />
              </div>
            </div>
          </div>

          {/* Mobile stats row */}
          <div className="md:hidden mt-5 grid grid-cols-4 gap-2">
            <MobileStatBox
              label="AUM"
              value={totalAum >= 1000 ? `${(totalAum / 1000).toFixed(1)}k` : String(totalAum || "---")}
              accent
            />
            <MobileStatBox label="Agents" value={String(totalAgents || "---")} />
            <MobileStatBox
              label="Avg PnL"
              value={agents.length > 0 ? `${avgPnl > 0 ? "+" : ""}${avgPnl.toFixed(1)}%` : "---"}
              accent={avgPnl > 0}
            />
            <MobileStatBox label="Users" value={String(totalInvestors || "---")} />
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="rounded-lg border border-arena-border bg-arena-card/50 px-4 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-arena-muted uppercase tracking-wider mr-1">filter:</span>
          {STRATEGIES.map((s) => (
            <button
              key={s}
              onClick={() => setActiveStrategy(s)}
              className={`rounded-md px-3 py-1.5 text-xs transition-all duration-200 ${
                s === activeStrategy
                  ? "bg-arena-accent/10 text-arena-accent border border-arena-accent/30 shadow-[0_0_10px_rgba(0,255,136,0.05)]"
                  : "text-arena-muted border border-arena-border hover:border-arena-accent/20 hover:text-arena-text hover:bg-arena-card"
              }`}
            >
              {s}
            </button>
          ))}
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-arena-muted uppercase tracking-wider">sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-md border border-arena-border bg-arena-bg px-3 py-1.5 text-xs text-arena-text cursor-pointer hover:border-arena-accent/20 transition-colors appearance-none pr-6 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666680%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_8px_center]"
            >
              <option value="pnl">pnl (high to low)</option>
              <option value="aum">aum (high to low)</option>
              <option value="winRate">win rate</option>
              <option value="newest">newest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section header */}
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-gradient-to-r from-arena-accent/20 to-transparent" />
        <span className="text-[10px] text-arena-muted uppercase tracking-widest">
          {activeStrategy === "all" ? "top agents" : activeStrategy}
        </span>
        <div className="h-px flex-1 bg-gradient-to-l from-arena-accent/20 to-transparent" />
      </div>

      {/* Agent grid */}
      {filteredAndSorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-arena-border bg-arena-card/30 p-16 gap-3">
          <SearchX className="w-8 h-8 text-arena-muted" />
          <span className="text-arena-muted text-sm">no agents found</span>
          <span className="text-arena-muted text-xs">try a different filter or deploy one yourself</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSorted.map((agent, index) => (
            <AgentCard key={agent.id} agent={agent} index={index} />
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="group relative flex items-center justify-center rounded-lg border border-dashed border-arena-border p-8 transition-all hover:border-arena-accent/30 hover:bg-arena-card/30">
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none rounded-lg" />
        <Link
          href="/create"
          className="relative flex items-center gap-2 text-arena-muted text-sm hover:text-arena-accent transition-colors"
        >
          <Plus className="w-4 h-4" />
          create your own trading agent
        </Link>
      </div>
    </div>
  );
}

/* ── Helper sub-components ──────────────────────────────── */

function StatBox({
  icon,
  label,
  value,
  sub,
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-arena-border bg-arena-bg/50 p-3 min-w-[130px]">
      <div className="flex items-center gap-1.5 text-[10px] text-arena-muted uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <div
        className={`text-xl font-bold mt-1 ${
          accent ? "text-arena-accent text-glow-green" : "text-arena-text"
        }`}
      >
        {value}
      </div>
      <div className="text-[10px] text-arena-muted mt-0.5">{sub}</div>
    </div>
  );
}

function MobileStatBox({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-arena-border bg-arena-bg/50 p-2 text-center">
      <div className="text-[10px] text-arena-muted">{label}</div>
      <div className={`text-sm font-bold ${accent ? "text-arena-accent" : "text-arena-text"}`}>
        {value}
      </div>
    </div>
  );
}
