import type { DataFeed } from "./types";

interface TokenPrice {
  price: number;
  change24h: number;
  volume24h: number;
}

export class PriceFeed implements DataFeed {
  private prices: Record<string, TokenPrice> = {};
  private polling: ReturnType<typeof setInterval> | null = null;

  async start() {
    console.log("[price] feed started");
    await this.fetch();
    // Poll every 60 seconds
    this.polling = setInterval(() => this.fetch(), 60_000);
  }

  async stop() {
    if (this.polling) clearInterval(this.polling);
    console.log("[price] feed stopped");
  }

  async getLatest() {
    return { prices: this.prices };
  }

  private async fetch() {
    try {
      // Fetch prices from Birdeye or Jupiter price API
      const tokens = ["SOL", "BONK", "WIF", "JUP", "JTO", "PYTH", "RAY", "ORCA"];

      // Using Jupiter price API (free, no auth needed)
      const ids = tokens.join(",");
      const res = await globalThis.fetch(
        `https://api.jup.ag/price/v2?ids=${ids}`
      );

      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          for (const [token, info] of Object.entries(data.data) as Array<[string, Record<string, unknown>]>) {
            this.prices[token] = {
              price: info.price as number,
              change24h: (info.priceChange24h as number) || 0,
              volume24h: (info.volume24h as number) || 0,
            };
          }
        }
      }

      console.log(`[price] updated ${Object.keys(this.prices).length} token prices`);
    } catch (err) {
      console.error("[price] fetch error:", err);
    }
  }
}
