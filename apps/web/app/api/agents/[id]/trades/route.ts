import { NextRequest, NextResponse } from "next/server";
import { getAgent, getAgentTrades } from "@/lib/store";

// GET /api/agents/[id]/trades
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const agent = getAgent(id);
  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const agentTrades = getAgentTrades(id);

  return NextResponse.json(agentTrades);
}
