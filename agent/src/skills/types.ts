import type { SkillId } from "@openclaw/types";

export interface TradeSignal {
  skill: SkillId;
  action: "BUY" | "SELL" | "STAKE" | "UNSTAKE" | "LEND" | "BORROW";
  token: string;
  confidence: number; // -1 to 1, negative = bearish
  reason: string;
  suggestedAmount?: number; // as % of vault
}

export interface Skill {
  id: SkillId;
  analyze(feedData: Record<string, unknown>): Promise<TradeSignal[]>;
  execute(signal: TradeSignal): Promise<string | null>; // returns tx signature
}
