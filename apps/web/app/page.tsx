import { AgentMarketplace } from "@/components/agents/agent-marketplace";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

interface ApiAgent {
  id: string;
  name: string;
  description: string;
  creator: string;
  strategy: string;
  skills: string[];
  verified: boolean;
  stats: {
    totalPnl: number;
    pnlPercentage: number;
    winRate: number;
    totalTrades: number;
    aum: number;
    investors: number;
    maxDrawdown: number;
    sharpeRatio: number;
    uptime: number;
  } | null;
}

function mapAgent(a: ApiAgent) {
  return {
    id: a.id,
    name: a.name,
    description: a.description,
    creator: a.creator,
    strategy: a.strategy,
    skills: a.skills,
    verified: a.verified,
    stats: {
      pnl: a.stats?.totalPnl ?? 0,
      pnlPct: a.stats?.pnlPercentage ?? 0,
      winRate: a.stats?.winRate ?? 0,
      trades: a.stats?.totalTrades ?? 0,
      aum: a.stats?.aum ?? 0,
      investors: a.stats?.investors ?? 0,
      maxDrawdown: a.stats?.maxDrawdown ?? 0,
    },
  };
}

export default async function HomePage() {
  let agents: ApiAgent[] = [];
  try {
    const res = await fetch(`${BASE_URL}/api/agents`, { cache: "no-store" });
    if (res.ok) {
      agents = await res.json();
    }
  } catch {
    // If the fetch fails (e.g. during build), fall back to empty
  }

  const mappedAgents = agents.map(mapAgent);

  // Compute summary stats
  const totalAum = mappedAgents.reduce((sum, a) => sum + a.stats.aum, 0);
  const totalAgents = mappedAgents.length;

  return <AgentMarketplace agents={mappedAgents} totalAum={totalAum} totalAgents={totalAgents} />;
}
