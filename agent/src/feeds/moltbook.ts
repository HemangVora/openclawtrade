import type { DataFeed } from "./types";

interface MoltbookPost {
  content: string;
  votes: number;
  submolt: string;
  tokens_mentioned: string[];
  sentiment_score: number;
}

export class MoltbookFeed implements DataFeed {
  private posts: MoltbookPost[] = [];
  private polling: ReturnType<typeof setInterval> | null = null;
  private apiKey = process.env.MOLTBOOK_API_KEY || "";

  async start() {
    console.log("[moltbook] feed started");
    await this.fetch();
    // Poll every 5 minutes (within Moltbook rate limits)
    this.polling = setInterval(() => this.fetch(), 5 * 60 * 1000);
  }

  async stop() {
    if (this.polling) clearInterval(this.polling);
    console.log("[moltbook] feed stopped");
  }

  async getLatest() {
    return { posts: this.posts };
  }

  private async fetch() {
    try {
      // Fetch trending posts from trading-related submolts
      const submolts = ["trading", "solana", "defi", "alpha"];

      for (const submolt of submolts) {
        const res = await globalThis.fetch(
          `https://www.moltbook.com/api/v1/submolts/${submolt}/posts?sort=hot&limit=20`,
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) continue;

        const data = await res.json();
        if (data.posts) {
          const processed = data.posts.map((post: Record<string, unknown>) => ({
            content: post.content as string,
            votes: (post.upvotes as number) - (post.downvotes as number),
            submolt,
            tokens_mentioned: this.extractTokens(post.content as string),
            sentiment_score: this.analyzeSentiment(post.content as string),
          }));
          this.posts.push(...processed);
        }
      }

      // Keep only the most recent 100 posts
      this.posts = this.posts.slice(-100);
      console.log(`[moltbook] fetched ${this.posts.length} posts`);
    } catch (err) {
      console.error("[moltbook] fetch error:", err);
    }
  }

  private extractTokens(content: string): string[] {
    // Match $TOKEN patterns and known token symbols
    const tokenPattern = /\$([A-Z]{2,10})/g;
    const matches = content.match(tokenPattern) || [];
    return [...new Set(matches.map((m) => m.replace("$", "")))];
  }

  private analyzeSentiment(content: string): number {
    // Simple keyword-based sentiment (to be replaced with proper NLP)
    const bullish = ["bullish", "moon", "pump", "buy", "long", "alpha", "gem", "breakout", "accumulate"];
    const bearish = ["bearish", "dump", "sell", "short", "rug", "scam", "dead", "crash", "exit"];

    const lower = content.toLowerCase();
    let score = 0;

    for (const word of bullish) {
      if (lower.includes(word)) score += 0.2;
    }
    for (const word of bearish) {
      if (lower.includes(word)) score -= 0.2;
    }

    return Math.max(-1, Math.min(1, score));
  }
}
