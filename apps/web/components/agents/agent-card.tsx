"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Users, BarChart3, Shield } from "lucide-react";
import { useMemo } from "react";

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
  index?: number;
}

const SKILL_COLORS: Record<string, string> = {
  swap: "text-blue-400 border-blue-400/30 bg-blue-400/5",
  stake: "text-green-400 border-green-400/30 bg-green-400/5",
  lend: "text-purple-400 border-purple-400/30 bg-purple-400/5",
  lp: "text-cyan-400 border-cyan-400/30 bg-cyan-400/5",
  snipe: "text-red-400 border-red-400/30 bg-red-400/5",
  sentiment: "text-yellow-400 border-yellow-400/30 bg-yellow-400/5",
  "on-chain-intel": "text-orange-400 border-orange-400/30 bg-orange-400/5",
  hedge: "text-indigo-400 border-indigo-400/30 bg-indigo-400/5",
};

/**
 * Generates a deterministic pseudo-random sparkline from agent stats.
 * Returns an array of 12 values between 0 and 1.
 */
function useSparklineData(agent: AgentCardProps["agent"]): number[] {
  return useMemo(() => {
    // Seed a simple PRNG from agent id
    let seed = 0;
    for (let i = 0; i < agent.id.length; i++) {
      seed = ((seed << 5) - seed + agent.id.charCodeAt(i)) | 0;
    }
    const rng = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };

    const points: number[] = [];
    const trend = agent.stats.pnlPct > 0 ? 0.55 : 0.45; // Bias direction
    let value = 0.5;
    for (let i = 0; i < 12; i++) {
      value += (rng() - trend) * 0.2;
      value = Math.max(0.05, Math.min(0.95, value));
      points.push(value);
    }
    // Ensure last point reflects overall PnL direction
    if (agent.stats.pnlPct > 0) {
      points[points.length - 1] = Math.max(points[points.length - 1], 0.65);
    } else {
      points[points.length - 1] = Math.min(points[points.length - 1], 0.35);
    }
    return points;
  }, [agent.id, agent.stats.pnlPct]);
}

function MiniSparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const height = 24;
  const width = 80;
  const color = positive ? "rgba(0, 255, 136, 0.6)" : "rgba(255, 68, 68, 0.6)";

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - v * height;
    return `${x},${y}`;
  });

  const linePath = `M${points.join(" L")}`;
  const fillPath = `${linePath} L${width},${height} L0,${height} Z`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`sparkGrad-${positive ? 'g' : 'r'}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={positive ? "rgba(0,255,136,0.15)" : "rgba(255,68,68,0.15)"} />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#sparkGrad-${positive ? 'g' : 'r'})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* End dot */}
      <circle
        cx={(data.length - 1) / (data.length - 1) * width}
        cy={height - data[data.length - 1] * height}
        r="2"
        fill={positive ? "#00ff88" : "#ff4444"}
      />
    </svg>
  );
}

export function AgentCard({ agent, index = 0 }: AgentCardProps) {
  const isPositive = agent.stats.pnl >= 0;
  const sparkData = useSparklineData(agent);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
    >
      <Link href={`/agent/${agent.id}`}>
        <div
          className={`group relative rounded-lg border bg-arena-card p-4 transition-all duration-300 cursor-pointer ${
            isPositive
              ? "border-arena-border card-glow-green"
              : "border-arena-border card-glow-red"
          }`}
        >
          {/* Top-right sparkline */}
          <div className="absolute top-4 right-4 opacity-60 group-hover:opacity-100 transition-opacity">
            <MiniSparkline data={sparkData} positive={isPositive} />
          </div>

          {/* Header */}
          <div className="flex items-start gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold border transition-all duration-300 ${
                isPositive
                  ? "bg-arena-accent/10 text-arena-accent border-arena-accent/20 group-hover:bg-arena-accent/15"
                  : "bg-arena-red/10 text-arena-red border-arena-red/20 group-hover:bg-arena-red/15"
              }`}
            >
              {agent.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm truncate">{agent.name}</span>
                {agent.verified && (
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-arena-accent/10 border border-arena-accent/30">
                    <Shield className="w-2.5 h-2.5 text-arena-accent" />
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-arena-muted truncate">{agent.creator}</span>
                <span className="rounded-md border border-arena-border bg-arena-bg px-1.5 py-0.5 text-[10px] text-arena-muted">
                  {agent.strategy}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="mt-3 text-xs text-arena-muted line-clamp-2 leading-relaxed">
            {agent.description}
          </p>

          {/* Skills */}
          <div className="mt-3 flex flex-wrap gap-1">
            {agent.skills.map((skill) => (
              <span
                key={skill}
                className={`rounded-md border px-1.5 py-0.5 text-[10px] ${
                  SKILL_COLORS[skill] || "text-arena-muted border-arena-border bg-arena-bg"
                }`}
              >
                {skill}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-4 gap-3 border-t border-arena-border pt-3">
            <div>
              <div className="text-[10px] text-arena-muted uppercase tracking-wider flex items-center gap-1">
                pnl
                {isPositive ? (
                  <TrendingUp className="w-2.5 h-2.5 text-arena-accent" />
                ) : (
                  <TrendingDown className="w-2.5 h-2.5 text-arena-red" />
                )}
              </div>
              <div
                className={`text-sm font-bold mt-0.5 ${
                  isPositive ? "text-arena-accent text-glow-green" : "text-arena-red text-glow-red"
                }`}
              >
                {isPositive ? "+" : ""}
                {agent.stats.pnlPct.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-[10px] text-arena-muted uppercase tracking-wider flex items-center gap-1">
                <BarChart3 className="w-2.5 h-2.5" />
                win
              </div>
              <div className="text-sm font-bold mt-0.5">{agent.stats.winRate}%</div>
            </div>
            <div>
              <div className="text-[10px] text-arena-muted uppercase tracking-wider">aum</div>
              <div className="text-sm font-bold mt-0.5">
                {agent.stats.aum >= 1000
                  ? `${(agent.stats.aum / 1000).toFixed(1)}k`
                  : agent.stats.aum.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-arena-muted uppercase tracking-wider flex items-center gap-1">
                <Users className="w-2.5 h-2.5" />
                inv
              </div>
              <div className="text-sm font-bold mt-0.5">{agent.stats.investors}</div>
            </div>
          </div>

          {/* Win rate bar */}
          <div className="mt-2 h-0.5 bg-arena-border rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                agent.stats.winRate >= 60
                  ? "bg-arena-accent"
                  : agent.stats.winRate >= 40
                  ? "bg-arena-yellow"
                  : "bg-arena-red"
              }`}
              style={{ width: `${agent.stats.winRate}%` }}
            />
          </div>

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] text-arena-muted">
              {agent.stats.trades.toLocaleString()} trades
              <span className="mx-1.5 text-arena-border">|</span>
              max dd {agent.stats.maxDrawdown}%
            </span>
            <span className="text-[10px] text-arena-accent opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
              view details &rarr;
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
