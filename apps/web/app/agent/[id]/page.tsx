"use client";

import { useState, useEffect, use } from "react";

interface AgentStats {
  totalPnl: number;
  pnlPercentage: number;
  winRate: number;
  totalTrades: number;
  maxDrawdown: number;
  sharpeRatio: number;
  aum: number;
  investors: number;
  uptime: number;
}

interface Vault {
  agentId: string;
  totalDeposited: number;
  currentValue: number;
  profitSplit: { investor: number; creator: number; platform: number };
  deposits: { investor: string; amount: number; depositedAt: string; currentValue: number }[];
}

interface AgentDetail {
  id: string;
  name: string;
  description: string;
  creator: string;
  strategy: string;
  skills: string[];
  verified: boolean;
  createdAt: string;
  riskTolerance: number;
  maxDrawdown: number;
  maxTradeSize: number;
  stats: AgentStats | null;
  vault: Vault | null;
}

interface Trade {
  id: string;
  agentId: string;
  skill: string;
  action: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
  amountOut: number;
  pnl: number;
  timestamp: string;
  txSignature: string;
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tab, setTab] = useState<"overview" | "trades" | "vault">("overview");
  const [depositAmount, setDepositAmount] = useState("");
  const [agent, setAgent] = useState<AgentDetail | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [depositing, setDepositing] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState<string | null>(null);
  const [depositError, setDepositError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [agentRes, tradesRes] = await Promise.all([
          fetch(`/api/agents/${id}`),
          fetch(`/api/agents/${id}/trades`),
        ]);

        if (!agentRes.ok) {
          setError("Agent not found");
          setLoading(false);
          return;
        }

        const agentData = await agentRes.json();
        setAgent(agentData);

        if (tradesRes.ok) {
          const tradesData = await tradesRes.json();
          setTrades(tradesData);
        }
      } catch {
        setError("Failed to load agent data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  async function handleDeposit() {
    if (!depositAmount || Number(depositAmount) <= 0) return;

    setDepositing(true);
    setDepositSuccess(null);
    setDepositError(null);

    try {
      const res = await fetch(`/api/agents/${id}/deposit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(depositAmount),
          investor: "0xuser...wallet", // placeholder wallet address
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setDepositError(data.error || "Deposit failed");
        return;
      }

      const data = await res.json();
      setDepositSuccess(`Deposited ${depositAmount} SOL successfully`);
      setDepositAmount("");

      // Refresh agent data to reflect updated vault
      if (data.vault && agent) {
        setAgent({
          ...agent,
          vault: data.vault,
          stats: agent.stats
            ? {
                ...agent.stats,
                aum: data.vault.currentValue,
                investors: new Set(data.vault.deposits.map((d: { investor: string }) => d.investor)).size,
              }
            : null,
        });
      }
    } catch {
      setDepositError("Failed to process deposit");
    } finally {
      setDepositing(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl flex items-center justify-center py-24">
        <div className="text-arena-muted text-sm">loading agent...</div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="mx-auto max-w-4xl flex items-center justify-center py-24">
        <div className="text-arena-red text-sm">{error || "Agent not found"}</div>
      </div>
    );
  }

  const stats = agent.stats;
  const vault = agent.vault;
  const isPositive = (stats?.totalPnl ?? 0) >= 0;

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
              {isPositive ? "+" : ""}{stats?.pnlPercentage ?? 0}%
            </div>
            <div className="text-sm text-arena-muted">
              {isPositive ? "+" : ""}{stats?.totalPnl ?? 0} SOL
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-6 gap-4 mt-6 pt-4 border-t border-arena-border">
          {[
            { label: "aum", value: `${(stats?.aum ?? 0).toLocaleString()} SOL` },
            { label: "investors", value: stats?.investors ?? 0 },
            { label: "win rate", value: `${stats?.winRate ?? 0}%` },
            { label: "trades", value: stats?.totalTrades ?? 0 },
            { label: "sharpe", value: stats?.sharpeRatio ?? 0 },
            { label: "uptime", value: `${stats?.uptime ?? 0}%` },
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
                <span className="text-xs">{agent.riskTolerance}/10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-arena-muted">max drawdown</span>
                <span className="text-xs">{agent.maxDrawdown}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-arena-muted">max trade size</span>
                <span className="text-xs">{agent.maxTradeSize}% of vault</span>
              </div>
            </div>
          </div>

          {/* Profit split */}
          <div className="rounded-lg border border-arena-border bg-arena-card p-5">
            <div className="text-xs text-arena-muted mb-3">profit split</div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-arena-muted">investor</span>
                <span className="text-xs text-arena-accent">{vault?.profitSplit.investor ?? 70}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-arena-muted">creator</span>
                <span className="text-xs">{vault?.profitSplit.creator ?? 20}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-arena-muted">platform</span>
                <span className="text-xs">{vault?.profitSplit.platform ?? 10}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "trades" && (
        <div className="rounded-lg border border-arena-border bg-arena-card overflow-hidden">
          {trades.length === 0 ? (
            <div className="flex items-center justify-center p-12">
              <span className="text-arena-muted text-sm">no trades yet</span>
            </div>
          ) : (
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
                {trades.map((trade) => (
                  <tr key={trade.id} className="border-b border-arena-border/50 hover:bg-arena-accent/[0.02]">
                    <td className="px-4 py-3 text-xs text-arena-muted">{timeAgo(trade.timestamp)}</td>
                    <td className="px-4 py-3 text-xs">{trade.skill}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${trade.action === "SELL" || trade.action === "SHORT" ? "text-arena-red" : "text-arena-accent"}`}>
                        {trade.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">{trade.tokenIn}/{trade.tokenOut}</td>
                    <td className="px-4 py-3 text-xs text-right">{trade.amountIn}</td>
                    <td className={`px-4 py-3 text-xs text-right font-semibold ${trade.pnl >= 0 ? "text-arena-accent" : "text-arena-red"}`}>
                      {trade.pnl >= 0 ? "+" : ""}{trade.pnl} SOL
                    </td>
                    <td className="px-4 py-3 text-xs text-right text-arena-muted">
                      {trade.txSignature.slice(0, 3)}...{trade.txSignature.slice(-3)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
              <button
                onClick={handleDeposit}
                disabled={depositing || !depositAmount || Number(depositAmount) <= 0}
                className="w-full rounded bg-arena-accent py-2 text-sm font-bold text-arena-bg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {depositing ? "depositing..." : "deposit"}
              </button>
              {depositSuccess && (
                <p className="text-[10px] text-arena-accent text-center">{depositSuccess}</p>
              )}
              {depositError && (
                <p className="text-[10px] text-arena-red text-center">{depositError}</p>
              )}
              <p className="text-[10px] text-arena-muted text-center">
                {vault?.profitSplit.investor ?? 70}% of profits go to you
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-arena-border bg-arena-card p-5">
            <div className="text-xs text-arena-muted mb-4">vault info</div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-arena-muted">total deposited</span>
                <span className="text-xs">{(vault?.totalDeposited ?? 0).toLocaleString()} SOL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-arena-muted">current value</span>
                <span className="text-xs">{(vault?.currentValue ?? 0).toLocaleString()} SOL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-arena-muted">investors</span>
                <span className="text-xs">{stats?.investors ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-arena-muted">deposits</span>
                <span className="text-xs">{vault?.deposits.length ?? 0}</span>
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
