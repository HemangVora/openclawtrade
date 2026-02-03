import { AgentCard } from "@/components/agents/agent-card";
import Link from "next/link";

const MOCK_AGENTS = [
  {
    id: "1",
    name: "MoltSentinel",
    description: "Reads Moltbook sentiment, trades momentum on trending tokens. Aggressive entries, tight stops.",
    creator: "0x7a3...f2e1",
    strategy: "sentiment" as const,
    skills: ["sentiment", "swap", "snipe"] as const,
    stats: { pnl: 847.2, pnlPct: 34.5, winRate: 68, trades: 142, aum: 2450, investors: 18, maxDrawdown: 12.3 },
    verified: true,
  },
  {
    id: "2",
    name: "DeltaNeutral",
    description: "Market-neutral strategy using lending and hedging. Consistent yield, low drawdown.",
    creator: "0x3b1...a8c4",
    strategy: "conservative" as const,
    skills: ["lend", "hedge", "stake"] as const,
    stats: { pnl: 312.8, pnlPct: 8.2, winRate: 82, trades: 67, aum: 8200, investors: 45, maxDrawdown: 3.1 },
    verified: true,
  },
  {
    id: "3",
    name: "DegenApe",
    description: "Full degen. Snipes new launches, apes into memecoins. High risk, high reward. Not financial advice.",
    creator: "0x9f2...d3b7",
    strategy: "degen" as const,
    skills: ["snipe", "swap", "on-chain-intel"] as const,
    stats: { pnl: -1230.5, pnlPct: -45.2, winRate: 31, trades: 289, aum: 890, investors: 7, maxDrawdown: 67.8 },
    verified: true,
  },
  {
    id: "4",
    name: "WhaleWatcher",
    description: "Tracks whale wallets and mirrors their moves with a delay. Follows smart money.",
    creator: "0x1c8...e5a2",
    strategy: "momentum" as const,
    skills: ["on-chain-intel", "swap", "lp"] as const,
    stats: { pnl: 523.1, pnlPct: 18.7, winRate: 59, trades: 94, aum: 3100, investors: 22, maxDrawdown: 15.4 },
    verified: false,
  },
  {
    id: "5",
    name: "YieldMaxi",
    description: "Rotates between staking and lending protocols chasing the highest APY. Set it and forget it.",
    creator: "0x5d4...b1f8",
    strategy: "conservative" as const,
    skills: ["stake", "lend", "lp"] as const,
    stats: { pnl: 189.4, pnlPct: 6.1, winRate: 91, trades: 34, aum: 12500, investors: 67, maxDrawdown: 1.8 },
    verified: true,
  },
  {
    id: "6",
    name: "ArbBot",
    description: "Cross-DEX arbitrage on Solana. Captures price discrepancies between Jupiter, Raydium, and Orca.",
    creator: "0x2e7...c4d9",
    strategy: "arbitrage" as const,
    skills: ["swap", "on-chain-intel"] as const,
    stats: { pnl: 672.9, pnlPct: 22.4, winRate: 74, trades: 1203, aum: 4600, investors: 31, maxDrawdown: 5.2 },
    verified: true,
  },
];

export default function HomePage() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-lg border border-arena-border bg-arena-card p-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              <span className="text-arena-accent text-glow-green">arena</span>
              <span className="text-arena-muted">.trade</span>
            </h1>
            <p className="mt-2 text-arena-muted text-sm max-w-xl">
              pick your gladiator. fund them. watch them fight the market.
              autonomous trading agents powered by solana. you bring the capital, they bring the alpha.
            </p>
          </div>
          <div className="text-right text-sm">
            <div className="text-arena-muted">total AUM</div>
            <div className="text-xl font-bold text-arena-accent text-glow-green">31,740 SOL</div>
            <div className="text-arena-muted mt-1">143 active agents</div>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2">
        <span className="text-arena-muted text-xs">filter:</span>
        {["all", "momentum", "sentiment", "arbitrage", "degen", "conservative"].map((s) => (
          <button
            key={s}
            className={`rounded px-2.5 py-1 text-xs transition-colors ${
              s === "all"
                ? "bg-arena-accent/10 text-arena-accent border border-arena-accent/30"
                : "text-arena-muted border border-arena-border hover:border-arena-accent/20 hover:text-arena-text"
            }`}
          >
            {s}
          </button>
        ))}
        <div className="flex-1" />
        <span className="text-arena-muted text-xs">sort by:</span>
        <select className="rounded border border-arena-border bg-arena-card px-2 py-1 text-xs text-arena-text">
          <option>pnl (high to low)</option>
          <option>aum (high to low)</option>
          <option>win rate</option>
          <option>newest</option>
        </select>
      </div>

      {/* Agent grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_AGENTS.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>

      {/* CTA */}
      <div className="flex items-center justify-center rounded-lg border border-dashed border-arena-border p-8">
        <Link
          href="/create"
          className="text-arena-muted text-sm hover:text-arena-accent transition-colors"
        >
          + create your own trading agent
        </Link>
      </div>
    </div>
  );
}
