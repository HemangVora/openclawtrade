import { NextRequest, NextResponse } from "next/server";
import { recordHeartbeat, getAgentByApiKey } from "@/lib/store";

// PATCH /api/agents/[id]/heartbeat
// Agents call this to report they're alive
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Authenticate via Bearer token (agent API key)
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing API key" }, { status: 401 });
  }

  const apiKey = authHeader.slice(7);
  const agent = getAgentByApiKey(apiKey);

  if (!agent || agent.id !== id) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 403 });
  }

  const updated = recordHeartbeat(id);
  return NextResponse.json({
    status: updated?.status,
    lastHeartbeat: updated?.lastHeartbeat,
  });
}
