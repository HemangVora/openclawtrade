import type { Skill, TradeSignal } from "./types";

export class SwapSkill implements Skill {
  id = "swap" as const;

  async analyze(feedData: Record<string, unknown>): Promise<TradeSignal[]> {
    const signals: TradeSignal[] = [];
    const priceData = feedData.price as { prices?: Record<string, { price: number; change24h: number }> } | undefined;

    if (!priceData?.prices) return signals;

    // Simple momentum strategy: buy tokens with strong positive momentum
    for (const [token, data] of Object.entries(priceData.prices)) {
      if (data.change24h > 10) {
        signals.push({
          skill: "swap",
          action: "BUY",
          token,
          confidence: Math.min(data.change24h / 30, 1),
          reason: `${token} up ${data.change24h.toFixed(1)}% in 24h — momentum play`,
          suggestedAmount: 5,
        });
      } else if (data.change24h < -15) {
        signals.push({
          skill: "swap",
          action: "SELL",
          token,
          confidence: -Math.min(Math.abs(data.change24h) / 30, 1),
          reason: `${token} down ${Math.abs(data.change24h).toFixed(1)}% in 24h — cutting losses`,
          suggestedAmount: 10,
        });
      }
    }

    return signals;
  }

  async execute(signal: TradeSignal): Promise<string | null> {
    console.log(`[swap] executing: ${signal.action} ${signal.token}`);
    // TODO: Build Jupiter swap instruction
    // TODO: Sign via Privy server wallet
    // TODO: Send transaction
    return null;
  }
}
