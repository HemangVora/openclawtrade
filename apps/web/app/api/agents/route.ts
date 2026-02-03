import { NextRequest, NextResponse } from "next/server";
import type { AgentStrategy } from "@openclaw/types";
import { getAllAgents, getAgentStats, createAgent } from "@/lib/store";

// GET /api/agents
// Query params: ?strategy=X  &sort=pnl|aum|winRate
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const strategyFilter = searchParams.get("strategy") as AgentStrategy | null;
  const sort = searchParams.get("sort"); // pnl | aum | winRate

  let agentsWithStats = getAllAgents().map((agent) => ({
    ...agent,
    stats: getAgentStats(agent.id) ?? null,
  }));

  // Filter by strategy
  if (strategyFilter) {
    agentsWithStats = agentsWithStats.filter(
      (a) => a.strategy === strategyFilter
    );
  }

  // Sort
  if (sort === "pnl") {
    agentsWithStats.sort(
      (a, b) => (b.stats?.totalPnl ?? 0) - (a.stats?.totalPnl ?? 0)
    );
  } else if (sort === "aum") {
    agentsWithStats.sort(
      (a, b) => (b.stats?.aum ?? 0) - (a.stats?.aum ?? 0)
    );
  } else if (sort === "winRate") {
    agentsWithStats.sort(
      (a, b) => (b.stats?.winRate ?? 0) - (a.stats?.winRate ?? 0)
    );
  }

  return NextResponse.json(agentsWithStats);
}

// POST /api/agents
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, description, creator, strategy, skills, riskTolerance, maxDrawdown, maxTradeSize, dailyLossLimit, allowedTokens } = body;

    // Basic validation
    if (!name || !description || !creator || !strategy || !skills) {
      return NextResponse.json(
        { error: "Missing required fields: name, description, creator, strategy, skills" },
        { status: 400 }
      );
    }

    const agent = createAgent({
      name,
      description,
      creator,
      strategy,
      skills,
      riskTolerance: riskTolerance ?? 5,
      maxDrawdown: maxDrawdown ?? 20,
      maxTradeSize: maxTradeSize ?? 10,
      dailyLossLimit: dailyLossLimit ?? 5,
      allowedTokens: allowedTokens ?? ["SOL"],
    });

    return NextResponse.json(agent, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
