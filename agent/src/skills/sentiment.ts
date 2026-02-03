import type { Skill, TradeSignal } from "./types";

interface MoltbookData {
  posts?: Array<{
    content: string;
    votes: number;
    submolt: string;
    tokens_mentioned: string[];
    sentiment_score: number;
  }>;
}

export class SentimentSkill implements Skill {
  id = "sentiment" as const;

  async analyze(feedData: Record<string, unknown>): Promise<TradeSignal[]> {
    const signals: TradeSignal[] = [];
    const moltbook = feedData.moltbook as MoltbookData | undefined;

    if (!moltbook?.posts) return signals;

    // Aggregate sentiment by token from Moltbook discussions
    const tokenSentiment: Record<string, { score: number; mentions: number; votes: number }> = {};

    for (const post of moltbook.posts) {
      for (const token of post.tokens_mentioned) {
        if (!tokenSentiment[token]) {
          tokenSentiment[token] = { score: 0, mentions: 0, votes: 0 };
        }
        tokenSentiment[token].score += post.sentiment_score * (1 + Math.log(Math.max(post.votes, 1)));
        tokenSentiment[token].mentions += 1;
        tokenSentiment[token].votes += post.votes;
      }
    }

    // Generate signals for tokens with strong sentiment + enough mentions
    for (const [token, data] of Object.entries(tokenSentiment)) {
      if (data.mentions < 3) continue; // need minimum signal

      const normalizedScore = data.score / data.mentions;

      if (normalizedScore > 0.5) {
        signals.push({
          skill: "sentiment",
          action: "BUY",
          token,
          confidence: Math.min(normalizedScore, 1),
          reason: `Moltbook bullish on ${token}: ${data.mentions} mentions, avg sentiment ${normalizedScore.toFixed(2)}`,
          suggestedAmount: Math.min(data.mentions, 8),
        });
      } else if (normalizedScore < -0.5) {
        signals.push({
          skill: "sentiment",
          action: "SELL",
          token,
          confidence: Math.max(normalizedScore, -1),
          reason: `Moltbook bearish on ${token}: ${data.mentions} mentions, avg sentiment ${normalizedScore.toFixed(2)}`,
          suggestedAmount: Math.min(data.mentions * 2, 15),
        });
      }
    }

    return signals;
  }

  async execute(signal: TradeSignal): Promise<string | null> {
    console.log(`[sentiment] executing: ${signal.action} ${signal.token} — ${signal.reason}`);
    // TODO: Execute swap based on sentiment signal
    return null;
  }
}
