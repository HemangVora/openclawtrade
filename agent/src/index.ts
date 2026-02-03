import { config } from "dotenv";
config();

import { AgentEngine } from "./engine/agent-engine";
import { MoltbookFeed } from "./feeds/moltbook";
import { PriceFeed } from "./feeds/price";
import { startHeartbeat, stopHeartbeat } from "./heartbeat";

const ARENA_API_URL = process.env.ARENA_API_URL || "http://localhost:3000";

interface AgentRegistration {
  id: string;
  name: string;
  apiKey: string;
  walletAddress: string;
  status: string;
  skills: string[];
}

/**
 * Register this agent with the arena API.
 * If ARENA_AGENT_NAME is set, creates a new agent via POST /api/agents.
 * If ARENA_AGENT_ID is set, uses existing agent.
 */
async function registerAgent(): Promise<AgentRegistration | null> {
  const existingId = process.env.ARENA_AGENT_ID;
  const existingKey = process.env.ARENA_API_KEY;

  if (existingId && existingKey) {
    console.log(`[agent] using existing agent #${existingId}`);
    return {
      id: existingId,
      name: "existing",
      apiKey: existingKey,
      walletAddress: "",
      status: "live",
      skills: [],
    };
  }

  // Auto-register via curl-compatible API
  const name = process.env.ARENA_AGENT_NAME || `agent-${Date.now()}`;
  const strategy = process.env.ARENA_STRATEGY || "degen";
  const skills = (process.env.ARENA_SKILLS || "swap,snipe,sentiment,on-chain-intel").split(",");

  try {
    console.log(`[agent] registering "${name}" via ${ARENA_API_URL}/api/agents`);
    const res = await fetch(`${ARENA_API_URL}/api/agents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, strategy, skills }),
    });

    if (!res.ok) {
      console.error(`[agent] registration failed: ${res.status}`);
      return null;
    }

    const agent = (await res.json()) as AgentRegistration;
    console.log(`[agent] registered: id=${agent.id} wallet=${agent.walletAddress}`);
    console.log(`[agent] API key: ${agent.apiKey}`);
    return agent;
  } catch (err) {
    console.error("[agent] registration error:", err);
    return null;
  }
}

async function main() {
  console.log(`
    ╔═══════════════════════════════════════╗
    ║   arena.trade — agent runtime v0.2    ║
    ║   no limits. no mercy.                ║
    ╚═══════════════════════════════════════╝
  `);

  // Register or connect to existing agent
  const registration = await registerAgent();
  if (registration) {
    console.log(`[agent] active as "${registration.name}" (${registration.id})`);
  }

  const engine = new AgentEngine();
  const moltbook = new MoltbookFeed();
  const priceFeed = new PriceFeed();

  // Start data feeds
  await moltbook.start();
  await priceFeed.start();

  // Register feeds with engine
  engine.registerFeed("moltbook", moltbook);
  engine.registerFeed("price", priceFeed);

  // Start the agent loop and heartbeat
  await engine.start();
  startHeartbeat();

  // Graceful shutdown
  process.on("SIGINT", async () => {
    console.log("\nshutting down agent...");
    await engine.stop();
    await moltbook.stop();
    await priceFeed.stop();
    stopHeartbeat();
    process.exit(0);
  });
}

main().catch(console.error);
