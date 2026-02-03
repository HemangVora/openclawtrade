import { NextRequest, NextResponse } from "next/server";
import { setAgentStatus, getAgent } from "@/lib/store";

// POST /api/agents/[id]/start
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const agent = getAgent(id);
  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  if (agent.status === "live") {
    return NextResponse.json({ message: "Agent already live", status: agent.status });
  }

  const updated = setAgentStatus(id, "live");
  return NextResponse.json({
    message: "Agent started",
    status: updated?.status,
    lastHeartbeat: updated?.lastHeartbeat,
  });
}
