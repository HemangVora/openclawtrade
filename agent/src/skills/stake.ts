import type { Skill, TradeSignal } from "./types";

export class StakeSkill implements Skill {
  id = "stake" as const;

  async analyze(feedData: Record<string, unknown>): Promise<TradeSignal[]> {
    const signals: TradeSignal[] = [];

    // TODO: Compare staking rates across Marinade, Jito, etc.
    // If idle SOL in vault exceeds threshold, suggest staking
    // If unstaking yields are higher elsewhere, suggest rotation

    return signals;
  }

  async execute(signal: TradeSignal): Promise<string | null> {
    console.log(`[stake] executing: ${signal.action} ${signal.token}`);
    // TODO: Stake/unstake via Marinade or Jito
    return null;
  }
}
