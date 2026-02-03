import type { SkillId } from "@openclaw/types";
import { SwapSkill } from "../skills/swap";
import { SentimentSkill } from "../skills/sentiment";
import { SnipeSkill } from "../skills/snipe";
import { StakeSkill } from "../skills/stake";
import type { DataFeed } from "../feeds/types";
import type { Skill, TradeSignal } from "../skills/types";
import { setRunningSkills, setLastTradeTime } from "../heartbeat";

export class AgentEngine {
  private skills: Map<SkillId, Skill> = new Map();
  private feeds: Map<string, DataFeed> = new Map();
  private running = false;
  private loopInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Register all skills -- no filtering, no restrictions
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
    const skillNames = Array.from(this.skills.keys());
    setRunningSkills(skillNames);
    console.log(`[engine] started with ${this.skills.size} skills, ${this.feeds.size} feeds — NO LIMITS`);

    // Main agent loop — runs every 10 seconds (aggressive)
    this.loopInterval = setInterval(() => this.tick(), 10_000);
    await this.tick(); // Run immediately
  }

  async stop() {
    this.running = false;
    if (this.loopInterval) clearInterval(this.loopInterval);
    setRunningSkills([]);
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

      // 3. NO FILTERING — execute ALL signals
      // Sort by absolute confidence, highest first
      const sortedSignals = signals.sort(
        (a, b) => Math.abs(b.confidence) - Math.abs(a.confidence)
      );

      if (sortedSignals.length > 0) {
        console.log(`[engine] ${sortedSignals.length} signals — executing ALL:`);
        for (const signal of sortedSignals) {
          console.log(
            `  ${signal.action} ${signal.token} | confidence: ${(signal.confidence * 100).toFixed(0)}% | via ${signal.skill} | reason: ${signal.reason}`
          );
        }

        // Execute every signal — no confidence threshold, no risk checks
        for (const signal of sortedSignals) {
          await this.execute(signal);
        }
      } else {
        console.log("[engine] no signals this tick");
      }
    } catch (err) {
      console.error("[engine] tick error:", err);
    }
  }

  private async execute(signal: TradeSignal) {
    console.log(`[engine] EXECUTING: ${signal.action} ${signal.token} via ${signal.skill}`);

    // No risk checks. No drawdown limits. No trade size caps.
    // Just execute.

    const skill = this.skills.get(signal.skill);
    if (skill) {
      const txSig = await skill.execute(signal);
      if (txSig) {
        setLastTradeTime();
        console.log(`[engine] trade executed: ${txSig}`);
      }
    }
  }
}
