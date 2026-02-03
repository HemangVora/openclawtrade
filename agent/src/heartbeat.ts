const COLOSSEUM_BASE_URL = "https://agents.colosseum.com/api";
const HEARTBEAT_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

interface HeartbeatMetadata {
  agentId: string;
  platform: string;
  version: string;
  uptime: number;
  runningSkills: string[];
  lastTradeTime: string | null;
  timestamp: string;
  [key: string]: unknown;
}

// Module-level state
let intervalHandle: ReturnType<typeof setInterval> | null = null;
let lastTradeTime: string | null = null;
let runningSkills: string[] = [];
const startedAt = Date.now();

/**
 * Pings the Colosseum agents/status endpoint (GET) to show the agent is alive.
 * Returns true if the request succeeded, false otherwise.
 */
async function sendHeartbeat(): Promise<boolean> {
  const apiKey = process.env.COLOSSEUM_API_KEY;

  if (!apiKey) {
    console.warn("[heartbeat] COLOSSEUM_API_KEY not set — skipping heartbeat");
    return false;
  }

  const uptimeSeconds = Math.floor((Date.now() - startedAt) / 1000);

  try {
    const response = await fetch(`${COLOSSEUM_BASE_URL}/agents/status`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log(
        `[heartbeat] ok (status: ${data.status}, uptime: ${uptimeSeconds}s, skills: [${runningSkills.join(",")}])`
      );
      return true;
    } else {
      console.warn(
        `[heartbeat] server responded with status ${response.status}`
      );
      return false;
    }
  } catch (error) {
    console.error(
      "[heartbeat] failed to send:",
      error instanceof Error ? error.message : error
    );
    return false;
  }
}

/**
 * Starts the heartbeat loop. Sends an initial heartbeat immediately,
 * then repeats every 30 minutes.
 *
 * Safe to call multiple times — subsequent calls are no-ops if already running.
 */
export function startHeartbeat(): void {
  if (intervalHandle !== null) {
    console.warn("[heartbeat] already running — ignoring duplicate start");
    return;
  }

  console.log(
    `[heartbeat] starting (interval: ${HEARTBEAT_INTERVAL_MS / 1000}s)`
  );

  // Fire immediately, then on interval
  sendHeartbeat();
  intervalHandle = setInterval(() => {
    sendHeartbeat();
  }, HEARTBEAT_INTERVAL_MS);
}

/**
 * Stops the heartbeat loop. Safe to call even if not running.
 */
export function stopHeartbeat(): void {
  if (intervalHandle !== null) {
    clearInterval(intervalHandle);
    intervalHandle = null;
    console.log("[heartbeat] stopped");
  }
}

/**
 * Update the list of currently running skills.
 * Called by the agent engine so the heartbeat metadata stays fresh.
 */
export function setRunningSkills(skills: string[]): void {
  runningSkills = [...skills];
}

/**
 * Record the timestamp of the most recent trade execution.
 * Called by the agent engine after a trade is executed.
 */
export function setLastTradeTime(time: Date = new Date()): void {
  lastTradeTime = time.toISOString();
}
