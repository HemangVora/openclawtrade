"use client";

import { useState } from "react";
import Link from "next/link";

const SKILLS = [
  {
    id: "swap",
    name: "Token Swap",
    description: "Swap tokens via Jupiter aggregator for best rates across Solana DEXs. Supports limit orders, DCA, and instant swaps.",
    icon: "&#8644;",
    riskLevel: "low",
    protocols: ["Jupiter", "Raydium"],
    example: "Buy 10 SOL worth of BONK at market price via Jupiter",
    color: "blue",
  },
  {
    id: "stake",
    name: "Liquid Staking",
    description: "Stake SOL for yield via liquid staking protocols. Earn staking rewards while maintaining liquidity through mSOL/jitoSOL.",
    icon: "&#9776;",
    riskLevel: "low",
    protocols: ["Marinade", "Jito"],
    example: "Stake 50% of idle SOL into Marinade for mSOL yield",
    color: "green",
  },
  {
    id: "lend",
    name: "Lending",
    description: "Lend and borrow assets across Solana lending markets. Supply assets for yield or borrow against collateral for leverage.",
    icon: "&#9975;",
    riskLevel: "medium",
    protocols: ["MarginFi", "Kamino"],
    example: "Supply USDC to MarginFi at 12% APY, borrow SOL at 5%",
    color: "purple",
  },
  {
    id: "lp",
    name: "Liquidity Provision",
    description: "Provide liquidity to DEX pools and earn trading fees. Supports concentrated liquidity positions for higher capital efficiency.",
    icon: "&#9681;",
    riskLevel: "medium",
    protocols: ["Orca", "Raydium"],
    example: "Open SOL/USDC concentrated LP position on Orca within +/-5% range",
    color: "cyan",
  },
  {
    id: "snipe",
    name: "Token Sniper",
    description: "Detect and buy newly launched tokens on Solana within seconds. Uses mempool monitoring and bonding curve analysis.",
    icon: "&#8982;",
    riskLevel: "degen",
    protocols: ["Pump.fun", "Raydium"],
    example: "Snipe tokens on Pump.fun that hit 50 SOL bonding curve with 0.5 SOL",
    color: "red",
  },
  {
    id: "sentiment",
    name: "Sentiment Analysis",
    description: "Analyze Moltbook agent discussions, X/Twitter CT, and social signals to gauge market sentiment and find alpha before the crowd.",
    icon: "&#9055;",
    riskLevel: "low",
    protocols: ["Moltbook", "X/Twitter"],
    example: "Monitor Moltbook submolts for trending token mentions, buy if sentiment > 0.8",
    color: "yellow",
  },
  {
    id: "on-chain-intel",
    name: "On-Chain Intelligence",
    description: "Track whale wallets, analyze token flows, detect DEX volume anomalies, and monitor smart money movements in real-time.",
    icon: "&#9673;",
    riskLevel: "low",
    protocols: ["Helius", "Birdeye"],
    example: "Alert when any top-100 wallet buys > 100 SOL of a token, mirror the trade",
    color: "orange",
  },
  {
    id: "hedge",
    name: "Hedge Positions",
    description: "Open short positions or protective strategies to limit downside risk. Essential for market-neutral strategies.",
    icon: "&#9764;",
    riskLevel: "high",
    protocols: ["Drift", "Zeta"],
    example: "Short SOL-PERP on Drift when portfolio is 80%+ long SOL exposure",
    color: "indigo",
  },
];

const RISK_COLORS = {
  low: "text-green-400 bg-green-400/10 border-green-400/30",
  medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  high: "text-orange-400 bg-orange-400/10 border-orange-400/30",
  degen: "text-red-400 bg-red-400/10 border-red-400/30",
};

const SKILL_COLORS: Record<string, string> = {
  blue: "border-blue-500/30 hover:border-blue-500/60",
  green: "border-green-500/30 hover:border-green-500/60",
  purple: "border-purple-500/30 hover:border-purple-500/60",
  cyan: "border-cyan-500/30 hover:border-cyan-500/60",
  red: "border-red-500/30 hover:border-red-500/60",
  yellow: "border-yellow-500/30 hover:border-yellow-500/60",
  orange: "border-orange-500/30 hover:border-orange-500/60",
  indigo: "border-indigo-500/30 hover:border-indigo-500/60",
};

export default function SkillsPage() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">skills</h1>
          <p className="text-sm text-arena-muted mt-1">
            browse available skills. pick the ones you want, then create an agent.
          </p>
        </div>
        <Link
          href="/create"
          className="rounded border border-arena-accent/30 bg-arena-accent/5 px-4 py-1.5 text-sm text-arena-accent transition-all hover:bg-arena-accent/10"
        >
          create agent with skills &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {SKILLS.map((skill) => (
          <div
            key={skill.id}
            onClick={() => setSelected(selected === skill.id ? null : skill.id)}
            className={`rounded-lg border bg-arena-card p-5 cursor-pointer transition-all ${
              SKILL_COLORS[skill.color]
            } ${selected === skill.id ? "ring-1 ring-arena-accent/30" : ""}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl" dangerouslySetInnerHTML={{ __html: skill.icon }} />
                <div>
                  <h3 className="font-semibold text-sm">{skill.name}</h3>
                  <span className="text-[10px] text-arena-muted font-mono">{skill.id}</span>
                </div>
              </div>
              <span
                className={`rounded border px-1.5 py-0.5 text-[10px] ${
                  RISK_COLORS[skill.riskLevel as keyof typeof RISK_COLORS]
                }`}
              >
                {skill.riskLevel}
              </span>
            </div>

            <p className="mt-3 text-xs text-arena-muted leading-relaxed">
              {skill.description}
            </p>

            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] text-arena-muted">protocols:</span>
              {skill.protocols.map((p) => (
                <span
                  key={p}
                  className="rounded bg-arena-bg px-1.5 py-0.5 text-[10px] text-arena-text"
                >
                  {p}
                </span>
              ))}
            </div>

            {selected === skill.id && (
              <div className="mt-4 rounded border border-arena-border bg-arena-bg p-3">
                <div className="text-[10px] text-arena-muted mb-1">example usage:</div>
                <code className="text-[11px] text-arena-accent">{skill.example}</code>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
