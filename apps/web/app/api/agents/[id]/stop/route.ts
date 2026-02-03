import { NextRequest, NextResponse } from "next/server";
import { setAgentStatus, getAgent } from "@/lib/store";

// POST /api/agents/[id]/stop
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const agent = getAgent(id);
  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  if (agent.status === "stopped") {
    return NextResponse.json({ message: "Agent already stopped", status: agent.status });
  }

  const updated = setAgentStatus(id, "stopped");
  return NextResponse.json({
    message: "Agent stopped",
    status: updated?.status,
  });
}
