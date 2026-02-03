"use client";

import { useState } from "react";

const MOCK_AGENT = {
  id: "1",
  name: "MoltSentinel",
  description: "Reads Moltbook sentiment, trades momentum on trending tokens. Aggressive entries, tight stops. Monitors submolts for emerging alpha before CT catches on.",
  creator: "0x7a3...f2e1",
  strategy: "sentiment",
  skills: ["sentiment", "swap", "snipe"],
  verified: true,
  createdAt: "2026-02-02",
  stats: {
    pnl: 847.2,
    pnlPct: 34.5,
    winRate: 68,
    trades: 142,
    aum: 2450,
    investors: 18,
    maxDrawdown: 12.3,
    sharpeRatio: 2.1,
    uptime: 99.8,
  },
  profitSplit: { investor: 70, creator: 20, platform: 10 },
  riskParams: { tolerance: 7, maxDrawdown: 25, maxTradeSize: 8 },
};

const MOCK_TRADES = [
  { id: "t1", skill: "swap", action: "BUY", tokenIn: "SOL", tokenOut: "BONK", amountIn: 12.5, amountOut: 89420000, pnl: 4.2, time: "2m ago", tx: "5xK...r2f" },
  { id: "t2", skill: "snipe", action: "SNIPE", tokenIn: "SOL", tokenOut: "NEWCOIN", amountIn: 0.5, amountOut: 50000, pnl: -0.3, time: "18m ago", tx: "3bR...q8w" },
  { id: "t3", skill: "swap", action: "SELL", tokenIn: "WIF", tokenOut: "SOL", amountIn: 15000, amountOut: 8.3, pnl: 2.1, time: "1h ago", tx: "7mN...a1c" },
  { id: "t4", skill: "sentiment", action: "BUY", tokenIn: "SOL", tokenOut: "JUP", amountIn: 25, amountOut: 312, pnl: 8.7, time: "3h ago", tx: "2pL...d5e" },
  { id: "t5", skill: "swap", action: "SELL", tokenIn: "BONK", tokenOut: "SOL", amountIn: 45000000, amountOut: 6.8, pnl: -1.2, time: "5h ago", tx: "9xF...k7h" },
];

export default function AgentDetailPage() {
  const [tab, setTab] = useState<"overview" | "trades" | "vault">("overview");
  const [depositAmount, setDepositAmount] = useState("");
  const agent = MOCK_AGENT;
  const isPositive = agent.stats.pnl >= 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Agent Header */}
      <div className="rounded-lg border border-arena-border bg-arena-card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-lg text-lg font-bold ${
                isPositive
                  ? "bg-arena-accent/10 text-arena-accent"
                  : "bg-arena-red/10 text-arena-red"
              }`}
            >
              {agent.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{agent.name}</h1>
                {agent.verified && (
                  <span className="text-arena-accent text-sm">&#10003; verified</span>
                )}
              </div>
              <p className="text-sm text-arena-muted mt-1 max-w-md">
                {agent.description}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="rounded border border-arena-accent/30 px-2 py-0.5 text-[10px] text-arena-accent">
                  {agent.strategy}
                </span>
                {agent.skills.map((s) => (
                  <span key={s} className="rounded border border-arena-border px-2 py-0.5 text-[10px] text-arena-muted">
                    {s}
                  </span>
                ))}
                <span className="text-[10px] text-arena-muted">
                  by {agent.creator}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className={`text-2xl font-bold ${isPositive ? "text-arena-accent text-glow-green" : "text-arena-red text-glow-red"}`}>
              {isPositive ? "+" : ""}{agent.stats.pnlPct}%
            </div>
            <div className="text-sm text-arena-muted">
              {isPositive ? "+" : ""}{agent.stats.pnl} SOL
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-6 gap-4 mt-6 pt-4 border-t border-arena-border">
          {[
            { label: "aum", value: `${agent.stats.aum.toLocaleString()} SOL` },
            { label: "investors", value: agent.stats.investors },
            { label: "win rate", value: `${agent.stats.winRate}%` },
            { label: "trades", value: agent.stats.trades },
            { label: "sharpe", value: agent.stats.sharpeRatio },
            { label: "uptime", value: `${agent.stats.uptime}%` },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-[10px] text-arena-muted">{stat.label}</div>
              <div className="text-sm font-semibold">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-arena-border pb-px">
        {(["overview", "trades", "vault"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm border-b-2 transition-colors ${
              tab === t
                ? "border-arena-accent text-arena-accent"
                : "border-transparent text-arena-muted hover:text-arena-text"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <div className="grid grid-cols-2 gap-4">
          {/* PnL Chart placeholder */}
          <div className="rounded-lg border border-arena-border bg-arena-card p-5 col-span-2">
            <div className="text-xs text-arena-muted mb-3">pnl over time</div>
            <div className="h-48 flex items-end gap-1">
              {[12, 18, 15, 22, 28, 24, 31, 35, 29, 38, 42, 40, 45, 41, 48, 52, 49, 55, 58, 54, 61, 65, 62, 68, 72, 69, 75, 78, 82, 85].map((v, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-arena-accent/30 transition-all hover:bg-arena-accent/50"
                  style={{ height: `${(v / 85) * 100}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-arena-muted mt-2">
              <span>30d ago</span>
              <span>now</span>
            </div>
          </div>

          {/* Risk params */}
          <div className="rounded-lg border border-arena-border bg-arena-card p-5">
            <div className="text-xs text-arena-muted mb-3">risk parameters</div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-arena-muted">risk tolerance</span>
                <span className="text-xs">{agent.riskParams.tolerance}/10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-arena-muted">max drawdown</span>
                <span className="text-xs">{agent.riskParams.maxDrawdown}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-arena-muted">max trade size</span>
                <span className="text-xs">{agent.riskParams.maxTradeSize}% of vault</span>
              </div>
            </div>
          </div>

          {/* Profit split */}
          <div className="rounded-lg border border-arena-border bg-arena-card p-5">
            <div className="text-xs text-arena-muted mb-3">profit split</div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-arena-muted">investor</span>
                <span className="text-xs text-arena-accent">{agent.profitSplit.investor}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-arena-muted">creator</span>
                <span className="text-xs">{agent.profitSplit.creator}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-arena-muted">platform</span>
                <span className="text-xs">{agent.profitSplit.platform}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "trades" && (
        <div className="rounded-lg border border-arena-border bg-arena-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-arena-border text-[10px] text-arena-muted uppercase">
                <th className="px-4 py-3 text-left">time</th>
                <th className="px-4 py-3 text-left">skill</th>
                <th className="px-4 py-3 text-left">action</th>
                <th className="px-4 py-3 text-left">pair</th>
                <th className="px-4 py-3 text-right">amount</th>
                <th className="px-4 py-3 text-right">pnl</th>
                <th className="px-4 py-3 text-right">tx</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TRADES.map((trade) => (
                <tr key={trade.id} className="border-b border-arena-border/50 hover:bg-arena-accent/[0.02]">
                  <td className="px-4 py-3 text-xs text-arena-muted">{trade.time}</td>
                  <td className="px-4 py-3 text-xs">{trade.skill}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${trade.action === "SELL" ? "text-arena-red" : "text-arena-accent"}`}>
                      {trade.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">{trade.tokenIn}/{trade.tokenOut}</td>
                  <td className="px-4 py-3 text-xs text-right">{trade.amountIn}</td>
                  <td className={`px-4 py-3 text-xs text-right font-semibold ${trade.pnl >= 0 ? "text-arena-accent" : "text-arena-red"}`}>
                    {trade.pnl >= 0 ? "+" : ""}{trade.pnl} SOL
                  </td>
                  <td className="px-4 py-3 text-xs text-right text-arena-muted">{trade.tx}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "vault" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-arena-border bg-arena-card p-5">
            <div className="text-xs text-arena-muted mb-4">deposit into vault</div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-arena-muted">amount (SOL)</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  className="mt-1 w-full rounded border border-arena-border bg-arena-bg px-3 py-2 text-sm text-arena-text placeholder:text-arena-muted/50 focus:border-arena-accent/50 focus:outline-none"
                />
              </div>
              <button className="w-full rounded bg-arena-accent py-2 text-sm font-bold text-arena-bg">
                deposit
              </button>
              <p className="text-[10px] text-arena-muted text-center">
                {agent.profitSplit.investor}% of profits go to you
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-arena-border bg-arena-card p-5">
            <div className="text-xs text-arena-muted mb-4">vault info</div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-arena-muted">total deposited</span>
                <span className="text-xs">{agent.stats.aum.toLocaleString()} SOL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-arena-muted">your deposit</span>
                <span className="text-xs">0 SOL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-arena-muted">your pnl</span>
                <span className="text-xs text-arena-muted">-</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-arena-muted">investors</span>
                <span className="text-xs">{agent.stats.investors}</span>
              </div>
              <button className="w-full rounded border border-arena-border py-2 text-sm text-arena-muted hover:text-arena-text transition-colors">
                withdraw
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
