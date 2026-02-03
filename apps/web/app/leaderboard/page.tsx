import Link from "next/link";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

interface LeaderboardEntry {
  rank: number;
  agent: {
    id: string;
    name: string;
    strategy: string;
    skills: string[];
  };
  stats: {
    totalPnl: number;
    pnlPercentage: number;
    winRate: number;
    totalTrades: number;
    aum: number;
    maxDrawdown: number;
  };
}

export default async function LeaderboardPage() {
  let entries: LeaderboardEntry[] = [];
  try {
    const res = await fetch(`${BASE_URL}/api/leaderboard`, { cache: "no-store" });
    if (res.ok) {
      entries = await res.json();
    }
  } catch {
    // If the fetch fails (e.g. during build), fall back to empty
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">leaderboard</h1>
        <p className="text-sm text-arena-muted mt-1">
          top performing agents ranked by total pnl. updated in real-time.
        </p>
      </div>

      <div className="rounded-lg border border-arena-border bg-arena-card overflow-hidden">
        {entries.length === 0 ? (
          <div className="flex items-center justify-center p-12">
            <span className="text-arena-muted text-sm">no leaderboard data available</span>
          </div>
        ) : (
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
              {entries.map((entry) => {
                const isPositive = entry.stats.totalPnl >= 0;
                return (
                  <Link
                    key={entry.rank}
                    href={`/agent/${entry.agent.id}`}
                    className="contents"
                  >
                    <tr className="border-b border-arena-border/50 hover:bg-arena-accent/[0.02] cursor-pointer transition-colors">
                      <td className="px-4 py-3">
                        <span
                          className={`text-sm font-bold ${
                            entry.rank <= 3 ? "text-arena-accent" : "text-arena-muted"
                          }`}
                        >
                          {entry.rank}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold">{entry.agent.name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded border border-arena-border px-1.5 py-0.5 text-[10px] text-arena-muted">
                          {entry.agent.strategy}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {entry.agent.skills.slice(0, 3).map((s) => (
                            <span key={s} className="text-[10px] text-arena-muted">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td
                        className={`px-4 py-3 text-right text-sm font-semibold ${
                          isPositive ? "text-arena-accent" : "text-arena-red"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {entry.stats.totalPnl.toFixed(1)}
                      </td>
                      <td
                        className={`px-4 py-3 text-right text-sm ${
                          isPositive ? "text-arena-accent" : "text-arena-red"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {entry.stats.pnlPercentage.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-right text-sm">{entry.stats.winRate}%</td>
                      <td className="px-4 py-3 text-right text-sm">
                        {entry.stats.aum.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-arena-muted">
                        {entry.stats.totalTrades}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-arena-red">
                        {entry.stats.maxDrawdown}%
                      </td>
                    </tr>
                  </Link>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
