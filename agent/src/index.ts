import { config } from "dotenv";
config();

import { AgentEngine } from "./engine/agent-engine";
import { MoltbookFeed } from "./feeds/moltbook";
import { PriceFeed } from "./feeds/price";

async function main() {
  console.log(`
    ╔═══════════════════════════════════════╗
    ║   arena.trade — agent runtime v0.1    ║
    ║   pick your gladiator.                ║
    ╚═══════════════════════════════════════╝
  `);

  const engine = new AgentEngine();
  const moltbook = new MoltbookFeed();
  const priceFeed = new PriceFeed();

  // Start data feeds
  await moltbook.start();
  await priceFeed.start();

  // Register feeds with engine
  engine.registerFeed("moltbook", moltbook);
  engine.registerFeed("price", priceFeed);

  // Start the agent loop
  await engine.start();

  // Graceful shutdown
  process.on("SIGINT", async () => {
    console.log("\nshutting down agent...");
    await engine.stop();
    await moltbook.stop();
    await priceFeed.stop();
    process.exit(0);
  });
}

main().catch(console.error);
