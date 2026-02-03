"use client";

import Link from "next/link";

interface AgentCardProps {
  agent: {
    id: string;
    name: string;
    description: string;
    creator: string;
    strategy: string;
    skills: readonly string[];
    stats: {
      pnl: number;
      pnlPct: number;
      winRate: number;
      trades: number;
      aum: number;
      investors: number;
      maxDrawdown: number;
    };
    verified: boolean;
  };
}

const SKILL_COLORS: Record<string, string> = {
  swap: "text-blue-400 border-blue-400/30",
  stake: "text-green-400 border-green-400/30",
  lend: "text-purple-400 border-purple-400/30",
  lp: "text-cyan-400 border-cyan-400/30",
  snipe: "text-red-400 border-red-400/30",
  sentiment: "text-yellow-400 border-yellow-400/30",
  "on-chain-intel": "text-orange-400 border-orange-400/30",
  hedge: "text-indigo-400 border-indigo-400/30",
};

export function AgentCard({ agent }: AgentCardProps) {
  const isPositive = agent.stats.pnl >= 0;

  return (
    <Link href={`/agent/${agent.id}`}>
      <div
        className={`group rounded-lg border bg-arena-card p-4 transition-all hover:border-arena-accent/30 cursor-pointer ${
          isPositive ? "border-arena-border" : "border-arena-border"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded text-xs font-bold ${
                isPositive
                  ? "bg-arena-accent/10 text-arena-accent"
                  : "bg-arena-red/10 text-arena-red"
              }`}
            >
              {agent.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm">{agent.name}</span>
                {agent.verified && (
                  <span className="text-arena-accent text-[10px]">&#10003;</span>
                )}
              </div>
              <div className="text-[10px] text-arena-muted">{agent.creator}</div>
            </div>
          </div>
          <span className="rounded border border-arena-border px-1.5 py-0.5 text-[10px] text-arena-muted">
            {agent.strategy}
          </span>
        </div>

        {/* Description */}
        <p className="mt-3 text-xs text-arena-muted line-clamp-2">
          {agent.description}
        </p>

        {/* Skills */}
        <div className="mt-3 flex flex-wrap gap-1">
          {agent.skills.map((skill) => (
            <span
              key={skill}
              className={`rounded border px-1.5 py-0.5 text-[10px] ${
                SKILL_COLORS[skill] || "text-arena-muted border-arena-border"
              }`}
            >
              {skill}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-4 gap-2 border-t border-arena-border pt-3">
          <div>
            <div className="text-[10px] text-arena-muted">pnl</div>
            <div
              className={`text-xs font-semibold ${
                isPositive ? "text-arena-accent" : "text-arena-red"
              }`}
            >
              {isPositive ? "+" : ""}
              {agent.stats.pnlPct.toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-[10px] text-arena-muted">win rate</div>
            <div className="text-xs font-semibold">{agent.stats.winRate}%</div>
          </div>
          <div>
            <div className="text-[10px] text-arena-muted">aum</div>
            <div className="text-xs font-semibold">
              {agent.stats.aum.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-arena-muted">investors</div>
            <div className="text-xs font-semibold">{agent.stats.investors}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] text-arena-muted">
            {agent.stats.trades} trades | max dd {agent.stats.maxDrawdown}%
          </span>
          <span className="text-[10px] text-arena-accent opacity-0 group-hover:opacity-100 transition-opacity">
            view &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
