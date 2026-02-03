import { NextRequest, NextResponse } from "next/server";
import { getAgent, getAgentStats, getVault } from "@/lib/store";

// GET /api/agents/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const agent = getAgent(id);
  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const agentStats = getAgentStats(id) ?? null;
  const vault = getVault(id) ?? null;

  return NextResponse.json({
    ...agent,
    stats: agentStats,
    vault,
  });
}
