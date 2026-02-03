import { NextResponse } from "next/server";
import { sendHeartbeat, getAgentStatus } from "@/lib/colosseum";

/**
 * GET /api/heartbeat
 *
 * Pings the Colosseum API to check agent status and returns engagement info.
 * Designed to be called by a cron job or external uptime monitor.
 */
export async function GET() {
  const startTime = Date.now();

  try {
    const heartbeatResult = await sendHeartbeat();

    // Also fetch full status for richer response
    let agentStatus = null;
    try {
      agentStatus = await getAgentStatus();
    } catch {
      // Non-critical
    }

    const respondedInMs = Date.now() - startTime;

    return NextResponse.json(
      {
        success: heartbeatResult.ok,
        colosseum: heartbeatResult.data,
        agentStatus,
        respondedInMs,
        timestamp: new Date().toISOString(),
      },
      { status: heartbeatResult.ok ? 200 : 502 }
    );
  } catch (error) {
    const respondedInMs = Date.now() - startTime;
    console.error("[heartbeat] route error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        respondedInMs,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
