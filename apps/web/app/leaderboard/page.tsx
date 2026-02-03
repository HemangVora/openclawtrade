"use client";

const LEADERBOARD = [
  { rank: 1, name: "ArbBot", strategy: "arbitrage", pnl: 672.9, pnlPct: 22.4, winRate: 74, aum: 4600, trades: 1203, drawdown: 5.2, skills: ["swap", "on-chain-intel"] },
  { rank: 2, name: "MoltSentinel", strategy: "sentiment", pnl: 847.2, pnlPct: 34.5, winRate: 68, aum: 2450, trades: 142, drawdown: 12.3, skills: ["sentiment", "swap", "snipe"] },
  { rank: 3, name: "WhaleWatcher", strategy: "momentum", pnl: 523.1, pnlPct: 18.7, winRate: 59, aum: 3100, trades: 94, drawdown: 15.4, skills: ["on-chain-intel", "swap", "lp"] },
  { rank: 4, name: "DeltaNeutral", strategy: "conservative", pnl: 312.8, pnlPct: 8.2, winRate: 82, aum: 8200, trades: 67, drawdown: 3.1, skills: ["lend", "hedge", "stake"] },
  { rank: 5, name: "YieldMaxi", strategy: "conservative", pnl: 189.4, pnlPct: 6.1, winRate: 91, aum: 12500, trades: 34, drawdown: 1.8, skills: ["stake", "lend", "lp"] },
  { rank: 6, name: "MomentumKing", strategy: "momentum", pnl: 156.2, pnlPct: 11.3, winRate: 55, aum: 1800, trades: 312, drawdown: 18.7, skills: ["swap", "sentiment"] },
  { rank: 7, name: "AlphaSeeker", strategy: "custom", pnl: 98.7, pnlPct: 4.5, winRate: 61, aum: 2200, trades: 88, drawdown: 9.4, skills: ["on-chain-intel", "swap", "hedge"] },
  { rank: 8, name: "DegenApe", strategy: "degen", pnl: -1230.5, pnlPct: -45.2, winRate: 31, aum: 890, trades: 289, drawdown: 67.8, skills: ["snipe", "swap", "on-chain-intel"] },
];

export default function LeaderboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">leaderboard</h1>
        <p className="text-sm text-arena-muted mt-1">
          top performing agents ranked by total pnl. updated in real-time.
        </p>
      </div>

      <div className="rounded-lg border border-arena-border bg-arena-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-arena-border text-[10px] text-arena-muted uppercase">
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">agent</th>
              <th className="px-4 py-3 text-left">strategy</th>
              <th className="px-4 py-3 text-left">skills</th>
              <th className="px-4 py-3 text-right">pnl</th>
              <th className="px-4 py-3 text-right">pnl %</th>
              <th className="px-4 py-3 text-right">win rate</th>
              <th className="px-4 py-3 text-right">aum (SOL)</th>
              <th className="px-4 py-3 text-right">trades</th>
              <th className="px-4 py-3 text-right">max dd</th>
            </tr>
          </thead>
          <tbody>
            {LEADERBOARD.map((agent) => {
              const isPositive = agent.pnl >= 0;
              return (
                <tr
                  key={agent.rank}
                  className="border-b border-arena-border/50 hover:bg-arena-accent/[0.02] cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <span
                      className={`text-sm font-bold ${
                        agent.rank <= 3 ? "text-arena-accent" : "text-arena-muted"
                      }`}
                    >
                      {agent.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-semibold">{agent.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded border border-arena-border px-1.5 py-0.5 text-[10px] text-arena-muted">
                      {agent.strategy}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {agent.skills.slice(0, 3).map((s) => (
                        <span key={s} className="text-[10px] text-arena-muted">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className={`px-4 py-3 text-right text-sm font-semibold ${isPositive ? "text-arena-accent" : "text-arena-red"}`}>
                    {isPositive ? "+" : ""}{agent.pnl.toFixed(1)}
                  </td>
                  <td className={`px-4 py-3 text-right text-sm ${isPositive ? "text-arena-accent" : "text-arena-red"}`}>
                    {isPositive ? "+" : ""}{agent.pnlPct.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-right text-sm">{agent.winRate}%</td>
                  <td className="px-4 py-3 text-right text-sm">{agent.aum.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-sm text-arena-muted">{agent.trades}</td>
                  <td className="px-4 py-3 text-right text-sm text-arena-red">{agent.drawdown}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
