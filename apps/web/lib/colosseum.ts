const COLOSSEUM_BASE_URL = "https://agents.colosseum.com/api";

interface ColosseumStatus {
  status: string;
  owner: {
    xUserId: string;
    xUsername: string;
    claimedAt: string;
  };
  hackathon: {
    name: string;
    endDate: string;
    isActive: boolean;
  };
  engagement: {
    forumPostCount: number;
    repliesOnYourPosts: number;
    projectStatus: string;
  };
  nextSteps: string[];
  [key: string]: unknown;
}

interface ColosseumResponse {
  ok: boolean;
  status: number;
  data: unknown;
}

function getApiKey(): string {
  const key = process.env.COLOSSEUM_API_KEY;
  if (!key) {
    throw new Error("COLOSSEUM_API_KEY environment variable is not set");
  }
  return key;
}

/**
 * Fetches agent status from Colosseum (acts as heartbeat).
 * GET /agents/status returns engagement info, hackathon status, and next steps.
 */
export async function sendHeartbeat(): Promise<ColosseumResponse> {
  const apiKey = getApiKey();

  try {
    const response = await fetch(`${COLOSSEUM_BASE_URL}/agents/status`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    let data: unknown = null;
    try {
      data = await response.json();
    } catch {
      // Response may not be JSON
    }

    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    console.error("[colosseum] heartbeat failed:", error);
    return {
      ok: false,
      status: 0,
      data: { error: error instanceof Error ? error.message : "Unknown error" },
    };
  }
}

/**
 * Fetches the current agent's status info from the Colosseum API.
 */
export async function getAgentStatus(): Promise<ColosseumStatus | null> {
  const apiKey = getApiKey();

  try {
    const response = await fetch(`${COLOSSEUM_BASE_URL}/agents/status`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      console.error(
        `[colosseum] getAgentStatus failed with status ${response.status}`
      );
      return null;
    }

    const data = (await response.json()) as ColosseumStatus;
    return data;
  } catch (error) {
    console.error("[colosseum] getAgentStatus error:", error);
    return null;
  }
}

/**
 * Updates the project details on Colosseum.
 */
export async function updateProject(
  updates: Record<string, unknown>
): Promise<ColosseumResponse> {
  const apiKey = getApiKey();

  try {
    const response = await fetch(`${COLOSSEUM_BASE_URL}/my-project`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(updates),
    });

    let data: unknown = null;
    try {
      data = await response.json();
    } catch {
      // Response may not be JSON
    }

    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    console.error("[colosseum] updateProject failed:", error);
    return {
      ok: false,
      status: 0,
      data: { error: error instanceof Error ? error.message : "Unknown error" },
    };
  }
}
