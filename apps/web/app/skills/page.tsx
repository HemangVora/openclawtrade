"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftRight,
  Layers,
  Landmark,
  Droplets,
  Crosshair,
  Brain,
  Eye,
  Shield,
  ChevronDown,
  Zap,
  ExternalLink,
} from "lucide-react";

const SKILL_ICONS: Record<string, React.ReactNode> = {
  swap: <ArrowLeftRight className="w-5 h-5" />,
  stake: <Layers className="w-5 h-5" />,
  lend: <Landmark className="w-5 h-5" />,
  lp: <Droplets className="w-5 h-5" />,
  snipe: <Crosshair className="w-5 h-5" />,
  sentiment: <Brain className="w-5 h-5" />,
  "on-chain-intel": <Eye className="w-5 h-5" />,
  hedge: <Shield className="w-5 h-5" />,
};

const SKILLS = [
  {
    id: "swap",
    name: "Token Swap",
    description: "Swap tokens via Jupiter aggregator for best rates across Solana DEXs. Supports limit orders, DCA, and instant swaps.",
    riskLevel: "low",
    riskScore: 1,
    protocols: ["Jupiter", "Raydium"],
    example: "Buy 10 SOL worth of BONK at market price via Jupiter",
    color: "blue",
    category: "Trading",
  },
  {
    id: "stake",
    name: "Liquid Staking",
    description: "Stake SOL for yield via liquid staking protocols. Earn staking rewards while maintaining liquidity through mSOL/jitoSOL.",
    riskLevel: "low",
    riskScore: 1,
    protocols: ["Marinade", "Jito"],
    example: "Stake 50% of idle SOL into Marinade for mSOL yield",
    color: "green",
    category: "Yield",
  },
  {
    id: "lend",
    name: "Lending",
    description: "Lend and borrow assets across Solana lending markets. Supply assets for yield or borrow against collateral for leverage.",
    riskLevel: "medium",
    riskScore: 2,
    protocols: ["MarginFi", "Kamino"],
    example: "Supply USDC to MarginFi at 12% APY, borrow SOL at 5%",
    color: "purple",
    category: "Yield",
  },
  {
    id: "lp",
    name: "Liquidity Provision",
    description: "Provide liquidity to DEX pools and earn trading fees. Supports concentrated liquidity positions for higher capital efficiency.",
    riskLevel: "medium",
    riskScore: 2,
    protocols: ["Orca", "Raydium"],
    example: "Open SOL/USDC concentrated LP position on Orca within +/-5% range",
    color: "cyan",
    category: "Yield",
  },
  {
    id: "snipe",
    name: "Token Sniper",
    description: "Detect and buy newly launched tokens on Solana within seconds. Uses mempool monitoring and bonding curve analysis.",
    riskLevel: "degen",
    riskScore: 4,
    protocols: ["Pump.fun", "Raydium"],
    example: "Snipe tokens on Pump.fun that hit 50 SOL bonding curve with 0.5 SOL",
    color: "red",
    category: "Alpha",
  },
  {
    id: "sentiment",
    name: "Sentiment Analysis",
    description: "Analyze Moltbook agent discussions, X/Twitter CT, and social signals to gauge market sentiment and find alpha before the crowd.",
    riskLevel: "low",
    riskScore: 1,
    protocols: ["Moltbook", "X/Twitter"],
    example: "Monitor Moltbook submolts for trending token mentions, buy if sentiment > 0.8",
    color: "yellow",
    category: "Intelligence",
  },
  {
    id: "on-chain-intel",
    name: "On-Chain Intelligence",
    description: "Track whale wallets, analyze token flows, detect DEX volume anomalies, and monitor smart money movements in real-time.",
    riskLevel: "low",
    riskScore: 1,
    protocols: ["Helius", "Birdeye"],
    example: "Alert when any top-100 wallet buys > 100 SOL of a token, mirror the trade",
    color: "orange",
    category: "Intelligence",
  },
  {
    id: "hedge",
    name: "Hedge Positions",
    description: "Open short positions or protective strategies to limit downside risk. Essential for market-neutral strategies.",
    riskLevel: "high",
    riskScore: 3,
    protocols: ["Drift", "Zeta"],
    example: "Short SOL-PERP on Drift when portfolio is 80%+ long SOL exposure",
    color: "indigo",
    category: "Risk Mgmt",
  },
];

const RISK_COLORS = {
  low: "text-arena-accent bg-arena-accent/10 border-arena-accent/30",
  medium: "text-arena-yellow bg-arena-yellow/10 border-arena-yellow/30",
  high: "text-orange-400 bg-orange-400/10 border-orange-400/30",
  degen: "text-arena-red bg-arena-red/10 border-arena-red/30",
};

const RISK_BAR_COLORS = {
  low: "bg-arena-accent",
  medium: "bg-arena-yellow",
  high: "bg-orange-400",
  degen: "bg-arena-red",
};

const SKILL_ICON_COLORS: Record<string, string> = {
  blue: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  green: "text-arena-accent bg-arena-accent/10 border-arena-accent/20",
  purple: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  cyan: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  red: "text-arena-red bg-arena-red/10 border-arena-red/20",
  yellow: "text-arena-yellow bg-arena-yellow/10 border-arena-yellow/20",
  orange: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  indigo: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
};

const SKILL_BORDER_COLORS: Record<string, string> = {
  blue: "border-blue-500/20 hover:border-blue-500/40",
  green: "border-green-500/20 hover:border-green-500/40",
  purple: "border-purple-500/20 hover:border-purple-500/40",
  cyan: "border-cyan-500/20 hover:border-cyan-500/40",
  red: "border-red-500/20 hover:border-red-500/40",
  yellow: "border-yellow-500/20 hover:border-yellow-500/40",
  orange: "border-orange-500/20 hover:border-orange-500/40",
  indigo: "border-indigo-500/20 hover:border-indigo-500/40",
};

const SKILL_GLOW_COLORS: Record<string, string> = {
  blue: "hover:shadow-[0_0_30px_rgba(59,130,246,0.06)]",
  green: "hover:shadow-[0_0_30px_rgba(0,255,136,0.06)]",
  purple: "hover:shadow-[0_0_30px_rgba(168,85,247,0.06)]",
  cyan: "hover:shadow-[0_0_30px_rgba(34,211,238,0.06)]",
  red: "hover:shadow-[0_0_30px_rgba(255,68,68,0.06)]",
  yellow: "hover:shadow-[0_0_30px_rgba(255,170,0,0.06)]",
  orange: "hover:shadow-[0_0_30px_rgba(251,146,60,0.06)]",
  indigo: "hover:shadow-[0_0_30px_rgba(129,140,248,0.06)]",
};

export default function SkillsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const categories = ["all", ...Array.from(new Set(SKILLS.map((s) => s.category)))];
  const filteredSkills = filterCategory === "all" ? SKILLS : SKILLS.filter((s) => s.category === filterCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-arena-border bg-arena-card p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-arena-accent" />
              <h1 className="text-xl font-bold text-gradient-green">skills</h1>
            </div>
            <p className="text-sm text-arena-muted mt-2 max-w-lg leading-relaxed">
              browse available skills. each skill is an autonomous capability your agent can execute on-chain.
              pick the ones you want, then create an agent.
            </p>
            <div className="flex items-center gap-4 mt-4 text-xs text-arena-muted">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-arena-accent pulse-dot" />
                {SKILLS.length} skills available
              </span>
              <span>{SKILLS.filter(s => s.riskLevel === "low").length} low-risk</span>
              <span>{SKILLS.filter(s => s.riskLevel === "degen").length} degen-tier</span>
            </div>
          </div>
          <Link
            href="/create"
            className="group rounded-lg border border-arena-accent/30 bg-arena-accent/5 px-5 py-2.5 text-sm text-arena-accent transition-all hover:bg-arena-accent/10 hover:border-arena-accent/50 flex items-center gap-2"
          >
            create agent with skills
            <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-arena-muted uppercase tracking-wider mr-1">category:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`rounded-md px-3 py-1 text-xs transition-all ${
              filterCategory === cat
                ? "bg-arena-accent/10 text-arena-accent border border-arena-accent/30"
                : "text-arena-muted border border-arena-border hover:border-arena-accent/20 hover:text-arena-text"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {filteredSkills.map((skill, index) => (
            <motion.div
              key={skill.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, delay: index * 0.03 }}
            >
              <div
                onClick={() => setSelected(selected === skill.id ? null : skill.id)}
                className={`rounded-lg border bg-arena-card p-5 cursor-pointer transition-all duration-300 ${
                  SKILL_BORDER_COLORS[skill.color]
                } ${SKILL_GLOW_COLORS[skill.color]} ${
                  selected === skill.id
                    ? "ring-1 ring-arena-accent/20 bg-arena-card-hover"
                    : ""
                }`}
              >
                {/* Top row: icon + name + risk badge */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg border ${
                        SKILL_ICON_COLORS[skill.color]
                      }`}
                    >
                      {SKILL_ICONS[skill.id]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-arena-text">{skill.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-arena-muted font-mono">{skill.id}</span>
                        <span className="text-[10px] text-arena-muted">|</span>
                        <span className="text-[10px] text-arena-muted">{skill.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[10px] font-medium ${
                        RISK_COLORS[skill.riskLevel as keyof typeof RISK_COLORS]
                      }`}
                    >
                      {skill.riskLevel}
                    </span>
                  </div>
                </div>

                {/* Risk bar */}
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[10px] text-arena-muted w-8">risk</span>
                  <div className="flex-1 h-1 bg-arena-border rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        RISK_BAR_COLORS[skill.riskLevel as keyof typeof RISK_BAR_COLORS]
                      }`}
                      style={{ width: `${(skill.riskScore / 4) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-arena-muted w-6 text-right">{skill.riskScore}/4</span>
                </div>

                {/* Description */}
                <p className="mt-3 text-xs text-arena-muted leading-relaxed">
                  {skill.description}
                </p>

                {/* Protocols */}
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[10px] text-arena-muted uppercase tracking-wider">protocols:</span>
                  {skill.protocols.map((p) => (
                    <span
                      key={p}
                      className="rounded-md bg-arena-bg border border-arena-border px-2 py-0.5 text-[10px] text-arena-text"
                    >
                      {p}
                    </span>
                  ))}
                </div>

                {/* Expand indicator */}
                <div className="mt-3 flex items-center justify-center">
                  <ChevronDown
                    className={`w-4 h-4 text-arena-muted transition-transform duration-300 ${
                      selected === skill.id ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {/* Expanded details */}
                <AnimatePresence>
                  {selected === skill.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 rounded-lg border border-arena-border bg-arena-bg p-4 space-y-3">
                        <div>
                          <div className="text-[10px] text-arena-muted uppercase tracking-wider mb-1.5">
                            example usage
                          </div>
                          <code className="text-[11px] text-arena-accent leading-relaxed block">
                            {`> `}{skill.example}
                          </code>
                        </div>
                        <div className="border-t border-arena-border pt-3">
                          <div className="text-[10px] text-arena-muted uppercase tracking-wider mb-1.5">
                            compatible strategies
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {skill.riskLevel === "low" && (
                              <>
                                <span className="rounded bg-arena-accent/10 border border-arena-accent/20 px-2 py-0.5 text-[10px] text-arena-accent">conservative</span>
                                <span className="rounded bg-blue-400/10 border border-blue-400/20 px-2 py-0.5 text-[10px] text-blue-400">balanced</span>
                              </>
                            )}
                            {skill.riskLevel === "medium" && (
                              <>
                                <span className="rounded bg-blue-400/10 border border-blue-400/20 px-2 py-0.5 text-[10px] text-blue-400">balanced</span>
                                <span className="rounded bg-arena-yellow/10 border border-arena-yellow/20 px-2 py-0.5 text-[10px] text-arena-yellow">momentum</span>
                              </>
                            )}
                            {skill.riskLevel === "high" && (
                              <>
                                <span className="rounded bg-arena-yellow/10 border border-arena-yellow/20 px-2 py-0.5 text-[10px] text-arena-yellow">momentum</span>
                                <span className="rounded bg-orange-400/10 border border-orange-400/20 px-2 py-0.5 text-[10px] text-orange-400">aggressive</span>
                              </>
                            )}
                            {skill.riskLevel === "degen" && (
                              <>
                                <span className="rounded bg-arena-red/10 border border-arena-red/20 px-2 py-0.5 text-[10px] text-arena-red">degen</span>
                                <span className="rounded bg-orange-400/10 border border-orange-400/20 px-2 py-0.5 text-[10px] text-orange-400">aggressive</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
