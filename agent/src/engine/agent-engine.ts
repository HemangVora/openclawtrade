import type { SkillId } from "@openclaw/types";
import { SwapSkill } from "../skills/swap";
import { SentimentSkill } from "../skills/sentiment";
import { SnipeSkill } from "../skills/snipe";
import { StakeSkill } from "../skills/stake";
import type { DataFeed } from "../feeds/types";
import type { Skill, TradeSignal } from "../skills/types";

export class AgentEngine {
  private skills: Map<SkillId, Skill> = new Map();
  private feeds: Map<string, DataFeed> = new Map();
  private running = false;
  private loopInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Register default skills
    this.skills.set("swap", new SwapSkill());
    this.skills.set("sentiment", new SentimentSkill());
    this.skills.set("snipe", new SnipeSkill());
    this.skills.set("stake", new StakeSkill());
  }

  registerFeed(name: string, feed: DataFeed) {
    this.feeds.set(name, feed);
  }

  async start() {
    this.running = true;
    console.log(`[engine] started with ${this.skills.size} skills, ${this.feeds.size} feeds`);

    // Main agent loop — runs every 30 seconds
    this.loopInterval = setInterval(() => this.tick(), 30_000);
    await this.tick(); // Run immediately
  }

  async stop() {
    this.running = false;
    if (this.loopInterval) clearInterval(this.loopInterval);
    console.log("[engine] stopped");
  }

  private async tick() {
    if (!this.running) return;

    try {
      // 1. Gather signals from all feeds
      const feedData: Record<string, unknown> = {};
      for (const [name, feed] of this.feeds) {
        feedData[name] = await feed.getLatest();
      }

      // 2. Run each skill's analysis
      const signals: TradeSignal[] = [];
      for (const [id, skill] of this.skills) {
        try {
          const skillSignals = await skill.analyze(feedData);
          signals.push(...skillSignals);
        } catch (err) {
          console.error(`[engine] skill ${id} error:`, err);
        }
      }

      // 3. Filter and rank signals
      const actionableSignals = signals
        .filter((s) => Math.abs(s.confidence) >= 0.6)
        .sort((a, b) => Math.abs(b.confidence) - Math.abs(a.confidence));

      if (actionableSignals.length > 0) {
        console.log(`[engine] ${actionableSignals.length} actionable signals:`);
        for (const signal of actionableSignals) {
          console.log(
            `  ${signal.action} ${signal.token} | confidence: ${(signal.confidence * 100).toFixed(0)}% | via ${signal.skill}`
          );
        }

        // 4. Execute top signal (with risk checks)
        const topSignal = actionableSignals[0];
        await this.execute(topSignal);
      } else {
        console.log("[engine] no actionable signals this tick");
      }
    } catch (err) {
      console.error("[engine] tick error:", err);
    }
  }

  private async execute(signal: TradeSignal) {
    console.log(`[engine] executing: ${signal.action} ${signal.token} via ${signal.skill}`);

    // TODO: Execute via Privy server wallet
    // 1. Build transaction based on skill type
    // 2. Apply risk checks (max trade size, drawdown limit)
    // 3. Sign and send via Privy API
    // 4. Record trade on-chain via arena program
    // 5. Emit webhook for dashboard

    const skill = this.skills.get(signal.skill);
    if (skill) {
      await skill.execute(signal);
    }
  }
}
