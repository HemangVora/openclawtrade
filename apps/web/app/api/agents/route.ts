import { NextRequest, NextResponse } from "next/server";
import type { AgentStrategy } from "@openclaw/types";
import { getAllAgents, getAgentStats, createAgent } from "@/lib/store";

// GET /api/agents
// Query params: ?strategy=X  &sort=pnl|aum|winRate  &status=live|stopped|error
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const strategyFilter = searchParams.get("strategy") as AgentStrategy | null;
  const statusFilter = searchParams.get("status");
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

  // Filter by status
  if (statusFilter) {
    agentsWithStats = agentsWithStats.filter(
      (a) => a.status === statusFilter
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
// Auto-deploys: generates API key, wallet, sets status=live
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, description, creator, strategy, skills } = body;

    // Minimal validation - name and skills are required, everything else is automated
    if (!name || !skills || !Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: name, skills" },
        { status: 400 }
      );
    }

    const agent = createAgent({
      name,
      description: description || `Autonomous ${strategy || "custom"} trading agent. No limits.`,
      creator: creator || "anonymous",
      strategy: strategy || "degen",
      skills,
    });

    return NextResponse.json(agent, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
