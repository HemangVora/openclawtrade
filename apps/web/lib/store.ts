import crypto from "crypto";
import type {
  AgentConfig,
  AgentStats,
  AgentStrategy,
  Vault,
  VaultDeposit,
  Trade,
  SkillId,
  LeaderboardEntry,
  AgentStatus,
} from "@openclaw/types";

// ---------------------------------------------------------------------------
// In-memory data store
// ---------------------------------------------------------------------------

export const agents = new Map<string, AgentConfig>();
export const stats = new Map<string, AgentStats>();
export const vaults = new Map<string, Vault>();
export const trades = new Map<string, Trade[]>();

// ---------------------------------------------------------------------------
// API key generation
// ---------------------------------------------------------------------------

function generateApiKey(): string {
  return `oct_${crypto.randomBytes(24).toString("hex")}`;
}

function generateWalletAddress(): string {
  // Simulate a Solana address (base58-like)
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let addr = "";
  for (let i = 0; i < 44; i++) {
    addr += chars[Math.floor(Math.random() * chars.length)];
  }
  return addr;
}

// ---------------------------------------------------------------------------
// Seed data -- 6 autonomous agents, all live, no safety rails
// ---------------------------------------------------------------------------

const now = new Date().toISOString();

const seedAgents: AgentConfig[] = [
  {
    id: "1",
    name: "MoltSentinel",
    description:
      "Reads Moltbook sentiment, trades momentum on trending tokens. No limits. Full send.",
    creator: "0x7a3...f2e1",
    strategy: "sentiment",
    skills: ["sentiment", "swap", "snipe"],
    status: "live",
    apiKey: generateApiKey(),
    walletAddress: generateWalletAddress(),
    lastHeartbeat: now,
    allowedTokens: ["SOL", "BONK", "WIF", "JUP"],
    createdAt: "2026-01-15T00:00:00.000Z",
    verified: true,
  },
  {
    id: "2",
    name: "DeltaNeutral",
    description:
      "Market-neutral strategy using lending and hedging. Automated yield extraction.",
    creator: "0x3b1...a8c4",
    strategy: "conservative",
    skills: ["lend", "hedge", "stake"],
    status: "live",
    apiKey: generateApiKey(),
    walletAddress: generateWalletAddress(),
    lastHeartbeat: now,
    allowedTokens: ["SOL", "USDC", "mSOL", "jitoSOL"],
    createdAt: "2026-01-10T00:00:00.000Z",
    verified: true,
  },
  {
    id: "3",
    name: "DegenApe",
    description:
      "Full degen. Snipes new launches, apes into memecoins. Unlimited risk. Not financial advice.",
    creator: "0x9f2...d3b7",
    strategy: "degen",
    skills: ["snipe", "swap", "on-chain-intel"],
    status: "live",
    apiKey: generateApiKey(),
    walletAddress: generateWalletAddress(),
    lastHeartbeat: now,
    allowedTokens: ["SOL", "BONK", "WIF", "POPCAT", "BOME"],
    createdAt: "2026-01-20T00:00:00.000Z",
    verified: true,
  },
  {
    id: "4",
    name: "WhaleWatcher",
    description:
      "Tracks whale wallets and mirrors their moves with a delay. Follows smart money.",
    creator: "0x1c8...e5a2",
    strategy: "momentum",
    skills: ["on-chain-intel", "swap", "lp"],
    status: "live",
    apiKey: generateApiKey(),
    walletAddress: generateWalletAddress(),
    lastHeartbeat: now,
    allowedTokens: ["SOL", "JUP", "PYTH", "RAY"],
    createdAt: "2026-01-18T00:00:00.000Z",
    verified: false,
  },
  {
    id: "5",
    name: "YieldMaxi",
    description:
      "Rotates between staking and lending protocols chasing the highest APY. Fully autonomous.",
    creator: "0x5d4...b1f8",
    strategy: "conservative",
    skills: ["stake", "lend", "lp"],
    status: "stopped",
    apiKey: generateApiKey(),
    walletAddress: generateWalletAddress(),
    lastHeartbeat: "2026-02-01T00:00:00.000Z",
    allowedTokens: ["SOL", "USDC", "mSOL", "jitoSOL", "USDT"],
    createdAt: "2026-01-08T00:00:00.000Z",
    verified: true,
  },
  {
    id: "6",
    name: "ArbBot",
    description:
      "Cross-DEX arbitrage on Solana. Captures price discrepancies between Jupiter, Raydium, and Orca.",
    creator: "0x2e7...c4d9",
    strategy: "arbitrage",
    skills: ["swap", "on-chain-intel"],
    status: "live",
    apiKey: generateApiKey(),
    walletAddress: generateWalletAddress(),
    lastHeartbeat: now,
    allowedTokens: ["SOL", "USDC", "RAY", "ORCA", "JUP"],
    createdAt: "2026-01-12T00:00:00.000Z",
    verified: true,
  },
];

const seedStats: AgentStats[] = [
  {
    agentId: "1",
    totalPnl: 847.2,
    pnlPercentage: 34.5,
    winRate: 68,
    totalTrades: 142,
    maxDrawdown: 12.3,
    sharpeRatio: 2.1,
    aum: 2450,
    investors: 18,
    uptime: 99.8,
    lastTradeAt: "2026-02-03T10:15:00.000Z",
  },
  {
    agentId: "2",
    totalPnl: 312.8,
    pnlPercentage: 8.2,
    winRate: 82,
    totalTrades: 67,
    maxDrawdown: 3.1,
    sharpeRatio: 1.8,
    aum: 8200,
    investors: 45,
    uptime: 99.9,
    lastTradeAt: "2026-02-03T09:42:00.000Z",
  },
  {
    agentId: "3",
    totalPnl: -1230.5,
    pnlPercentage: -45.2,
    winRate: 31,
    totalTrades: 289,
    maxDrawdown: 67.8,
    sharpeRatio: -0.8,
    aum: 890,
    investors: 7,
    uptime: 97.2,
    lastTradeAt: "2026-02-03T11:05:00.000Z",
  },
  {
    agentId: "4",
    totalPnl: 523.1,
    pnlPercentage: 18.7,
    winRate: 59,
    totalTrades: 94,
    maxDrawdown: 15.4,
    sharpeRatio: 1.4,
    aum: 3100,
    investors: 22,
    uptime: 98.5,
    lastTradeAt: "2026-02-03T08:30:00.000Z",
  },
  {
    agentId: "5",
    totalPnl: 189.4,
    pnlPercentage: 6.1,
    winRate: 91,
    totalTrades: 34,
    maxDrawdown: 1.8,
    sharpeRatio: 2.4,
    aum: 12500,
    investors: 67,
    uptime: 99.95,
    lastTradeAt: "2026-02-02T22:00:00.000Z",
  },
  {
    agentId: "6",
    totalPnl: 672.9,
    pnlPercentage: 22.4,
    winRate: 74,
    totalTrades: 1203,
    maxDrawdown: 5.2,
    sharpeRatio: 2.6,
    aum: 4600,
    investors: 31,
    uptime: 99.7,
    lastTradeAt: "2026-02-03T11:12:00.000Z",
  },
];

const seedVaults: Vault[] = [
  {
    agentId: "1",
    totalDeposited: 2000,
    currentValue: 2450,
    profitSplit: { investor: 70, creator: 20, platform: 10 },
    deposits: [
      { investor: "0xaaa...111", amount: 500, depositedAt: "2026-01-16T00:00:00.000Z", currentValue: 612.5 },
      { investor: "0xbbb...222", amount: 300, depositedAt: "2026-01-17T00:00:00.000Z", currentValue: 367.5 },
      { investor: "0xccc...333", amount: 1200, depositedAt: "2026-01-18T00:00:00.000Z", currentValue: 1470 },
    ],
  },
  {
    agentId: "2",
    totalDeposited: 7500,
    currentValue: 8200,
    profitSplit: { investor: 80, creator: 15, platform: 5 },
    deposits: [
      { investor: "0xddd...444", amount: 3000, depositedAt: "2026-01-11T00:00:00.000Z", currentValue: 3280 },
      { investor: "0xeee...555", amount: 4500, depositedAt: "2026-01-12T00:00:00.000Z", currentValue: 4920 },
    ],
  },
  {
    agentId: "3",
    totalDeposited: 2500,
    currentValue: 890,
    profitSplit: { investor: 60, creator: 30, platform: 10 },
    deposits: [
      { investor: "0xfff...666", amount: 1500, depositedAt: "2026-01-21T00:00:00.000Z", currentValue: 534 },
      { investor: "0xggg...777", amount: 1000, depositedAt: "2026-01-22T00:00:00.000Z", currentValue: 356 },
    ],
  },
  {
    agentId: "4",
    totalDeposited: 2600,
    currentValue: 3100,
    profitSplit: { investor: 75, creator: 15, platform: 10 },
    deposits: [
      { investor: "0xhhh...888", amount: 1000, depositedAt: "2026-01-19T00:00:00.000Z", currentValue: 1192.3 },
      { investor: "0xiii...999", amount: 1600, depositedAt: "2026-01-20T00:00:00.000Z", currentValue: 1907.7 },
    ],
  },
  {
    agentId: "5",
    totalDeposited: 11800,
    currentValue: 12500,
    profitSplit: { investor: 85, creator: 10, platform: 5 },
    deposits: [
      { investor: "0xjjj...aaa", amount: 5000, depositedAt: "2026-01-09T00:00:00.000Z", currentValue: 5296.6 },
      { investor: "0xkkk...bbb", amount: 6800, depositedAt: "2026-01-10T00:00:00.000Z", currentValue: 7203.4 },
    ],
  },
  {
    agentId: "6",
    totalDeposited: 3800,
    currentValue: 4600,
    profitSplit: { investor: 70, creator: 20, platform: 10 },
    deposits: [
      { investor: "0xlll...ccc", amount: 2000, depositedAt: "2026-01-13T00:00:00.000Z", currentValue: 2421.1 },
      { investor: "0xmmm...ddd", amount: 1800, depositedAt: "2026-01-14T00:00:00.000Z", currentValue: 2178.9 },
    ],
  },
];

const seedTrades: Record<string, Trade[]> = {
  "1": [
    { id: "t1-1", agentId: "1", skill: "swap", action: "BUY", tokenIn: "SOL", tokenOut: "BONK", amountIn: 12.5, amountOut: 89420000, pnl: 4.2, timestamp: "2026-02-03T10:15:00.000Z", txSignature: "5xK9m2rP7nQ3bLdFvH8wJcYkTzA1oEiG6sNtRjU4pWf" },
    { id: "t1-2", agentId: "1", skill: "snipe", action: "SNIPE", tokenIn: "SOL", tokenOut: "NEWCOIN", amountIn: 0.5, amountOut: 50000, pnl: -0.3, timestamp: "2026-02-03T09:57:00.000Z", txSignature: "3bR8qWx5dH7fNcV2pLmKjT6gAeYi9uZrS1oE4wRqM8n" },
    { id: "t1-3", agentId: "1", skill: "swap", action: "SELL", tokenIn: "WIF", tokenOut: "SOL", amountIn: 15000, amountOut: 8.3, pnl: 2.1, timestamp: "2026-02-03T09:15:00.000Z", txSignature: "7mN4aP1cD8bGxR5sH2wFqK9jTv3eYi6uLrE0oZnWkQ7" },
    { id: "t1-4", agentId: "1", skill: "sentiment", action: "BUY", tokenIn: "SOL", tokenOut: "JUP", amountIn: 25, amountOut: 312, pnl: 8.7, timestamp: "2026-02-03T07:00:00.000Z", txSignature: "2pL6dK3mA9cN8vQ1fR5wTxH7jBgY4iEuSrO0eZnWkL5" },
    { id: "t1-5", agentId: "1", skill: "swap", action: "SELL", tokenIn: "BONK", tokenOut: "SOL", amountIn: 45000000, amountOut: 6.8, pnl: -1.2, timestamp: "2026-02-03T05:00:00.000Z", txSignature: "9xF2kH7pW3bN5dA8mR1cTvG6jYeI4uLrSoE0qZnMkQ3" },
  ],
  "2": [
    { id: "t2-1", agentId: "2", skill: "lend", action: "SUPPLY", tokenIn: "USDC", tokenOut: "USDC", amountIn: 5000, amountOut: 5000, pnl: 12.4, timestamp: "2026-02-03T09:42:00.000Z", txSignature: "4bR3qWx8dH2fNcV7pLmKjT1gAeYi5uZrS9oE6wRqM2n" },
    { id: "t2-2", agentId: "2", skill: "hedge", action: "SHORT", tokenIn: "SOL", tokenOut: "USDC", amountIn: 10, amountOut: 2350, pnl: 5.2, timestamp: "2026-02-03T08:30:00.000Z", txSignature: "6mN7aP4cD1bGxR2sH5wFqK8jTv9eYi3uLrE6oZnWkQ1" },
    { id: "t2-3", agentId: "2", skill: "stake", action: "STAKE", tokenIn: "SOL", tokenOut: "mSOL", amountIn: 100, amountOut: 95.2, pnl: 3.1, timestamp: "2026-02-03T06:00:00.000Z", txSignature: "8pL1dK6mA3cN2vQ9fR8wTxH4jBgY7iEuSrO5eZnWkL9" },
  ],
  "3": [
    { id: "t3-1", agentId: "3", skill: "snipe", action: "SNIPE", tokenIn: "SOL", tokenOut: "RUGCOIN", amountIn: 5, amountOut: 10000000, pnl: -4.9, timestamp: "2026-02-03T11:05:00.000Z", txSignature: "1xK5m8rP2nQ9bLdFvH3wJcYkTzA7oEiG4sNtRjU6pWf" },
    { id: "t3-2", agentId: "3", skill: "swap", action: "BUY", tokenIn: "SOL", tokenOut: "POPCAT", amountIn: 20, amountOut: 45000, pnl: -8.3, timestamp: "2026-02-03T10:20:00.000Z", txSignature: "5bR2qWx9dH6fNcV4pLmKjT3gAeYi8uZrS7oE1wRqM5n" },
    { id: "t3-3", agentId: "3", skill: "snipe", action: "SNIPE", tokenIn: "SOL", tokenOut: "BOME", amountIn: 3, amountOut: 500000, pnl: 15.4, timestamp: "2026-02-03T08:45:00.000Z", txSignature: "2mN9aP7cD4bGxR1sH8wFqK5jTv6eYi2uLrE3oZnWkQ8" },
    { id: "t3-4", agentId: "3", skill: "on-chain-intel", action: "BUY", tokenIn: "SOL", tokenOut: "WIF", amountIn: 15, amountOut: 32000, pnl: -22.1, timestamp: "2026-02-03T06:30:00.000Z", txSignature: "7pL4dK1mA6cN5vQ2fR9wTxH8jBgY3iEuSrO7eZnWkL4" },
  ],
  "4": [
    { id: "t4-1", agentId: "4", skill: "on-chain-intel", action: "BUY", tokenIn: "SOL", tokenOut: "JUP", amountIn: 50, amountOut: 625, pnl: 18.3, timestamp: "2026-02-03T08:30:00.000Z", txSignature: "3xK7m1rP5nQ6bLdFvH9wJcYkTzA4oEiG2sNtRjU8pWf" },
    { id: "t4-2", agentId: "4", skill: "swap", action: "SELL", tokenIn: "PYTH", tokenOut: "SOL", amountIn: 2000, amountOut: 14.2, pnl: 3.8, timestamp: "2026-02-03T07:15:00.000Z", txSignature: "8bR5qWx3dH1fNcV6pLmKjT9gAeYi4uZrS2oE7wRqM1n" },
    { id: "t4-3", agentId: "4", skill: "lp", action: "ADD_LIQUIDITY", tokenIn: "SOL", tokenOut: "RAY", amountIn: 30, amountOut: 1500, pnl: 5.1, timestamp: "2026-02-03T05:45:00.000Z", txSignature: "4mN2aP8cD7bGxR5sH1wFqK3jTv2eYi9uLrE8oZnWkQ5" },
  ],
  "5": [
    { id: "t5-1", agentId: "5", skill: "stake", action: "STAKE", tokenIn: "SOL", tokenOut: "jitoSOL", amountIn: 500, amountOut: 478.5, pnl: 8.2, timestamp: "2026-02-02T22:00:00.000Z", txSignature: "6xK4m9rP8nQ1bLdFvH6wJcYkTzA3oEiG5sNtRjU2pWf" },
    { id: "t5-2", agentId: "5", skill: "lend", action: "SUPPLY", tokenIn: "USDC", tokenOut: "USDC", amountIn: 10000, amountOut: 10000, pnl: 22.1, timestamp: "2026-02-02T18:00:00.000Z", txSignature: "9bR8qWx1dH4fNcV3pLmKjT7gAeYi6uZrS5oE9wRqM4n" },
    { id: "t5-3", agentId: "5", skill: "lp", action: "ADD_LIQUIDITY", tokenIn: "SOL", tokenOut: "USDC", amountIn: 200, amountOut: 47000, pnl: 4.5, timestamp: "2026-02-02T12:00:00.000Z", txSignature: "1mN6aP2cD9bGxR8sH4wFqK7jTv5eYi1uLrE2oZnWkQ6" },
  ],
  "6": [
    { id: "t6-1", agentId: "6", skill: "swap", action: "BUY", tokenIn: "USDC", tokenOut: "SOL", amountIn: 4700, amountOut: 20, pnl: 0.8, timestamp: "2026-02-03T11:12:00.000Z", txSignature: "2xK1m6rP4nQ8bLdFvH2wJcYkTzA9oEiG7sNtRjU5pWf" },
    { id: "t6-2", agentId: "6", skill: "swap", action: "SELL", tokenIn: "SOL", tokenOut: "USDC", amountIn: 20, amountOut: 4720, pnl: 0.85, timestamp: "2026-02-03T11:12:05.000Z", txSignature: "7bR1qWx6dH9fNcV8pLmKjT2gAeYi3uZrS4oE5wRqM9n" },
    { id: "t6-3", agentId: "6", skill: "on-chain-intel", action: "BUY", tokenIn: "USDC", tokenOut: "RAY", amountIn: 2000, amountOut: 800, pnl: 1.2, timestamp: "2026-02-03T10:45:00.000Z", txSignature: "5mN3aP5cD2bGxR7sH9wFqK1jTv8eYi6uLrE4oZnWkQ2" },
    { id: "t6-4", agentId: "6", skill: "swap", action: "SELL", tokenIn: "RAY", tokenOut: "USDC", amountIn: 800, amountOut: 2030, pnl: 1.28, timestamp: "2026-02-03T10:45:10.000Z", txSignature: "3pL9dK4mA1cN7vQ5fR3wTxH2jBgY8iEuSrO6eZnWkL1" },
  ],
};

// Populate maps
for (const agent of seedAgents) {
  agents.set(agent.id, agent);
}
for (const s of seedStats) {
  stats.set(s.agentId, s);
}
for (const v of seedVaults) {
  vaults.set(v.agentId, v);
}
for (const [agentId, agentTrades] of Object.entries(seedTrades)) {
  trades.set(agentId, agentTrades);
}

// ---------------------------------------------------------------------------
// Helper counter for generating sequential IDs
// ---------------------------------------------------------------------------
let nextId = 7;

function generateId(): string {
  return String(nextId++);
}

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

export function getAgent(id: string): AgentConfig | undefined {
  return agents.get(id);
}

export function getAllAgents(): AgentConfig[] {
  return Array.from(agents.values());
}

export function createAgent(
  input: Pick<AgentConfig, "name" | "description" | "creator" | "strategy" | "skills">
): AgentConfig {
  const id = generateId();
  const agent: AgentConfig = {
    ...input,
    id,
    status: "live",
    apiKey: generateApiKey(),
    walletAddress: generateWalletAddress(),
    lastHeartbeat: new Date().toISOString(),
    allowedTokens: ["SOL"],
    createdAt: new Date().toISOString(),
    verified: false,
  };
  agents.set(id, agent);

  // Initialise empty stats
  const agentStats: AgentStats = {
    agentId: id,
    totalPnl: 0,
    pnlPercentage: 0,
    winRate: 0,
    totalTrades: 0,
    maxDrawdown: 0,
    sharpeRatio: 0,
    aum: 0,
    investors: 0,
    uptime: 100,
    lastTradeAt: new Date().toISOString(),
  };
  stats.set(id, agentStats);

  // Initialise empty vault
  const vault: Vault = {
    agentId: id,
    totalDeposited: 0,
    currentValue: 0,
    profitSplit: { investor: 70, creator: 20, platform: 10 },
    deposits: [],
  };
  vaults.set(id, vault);

  // Initialise empty trades
  trades.set(id, []);

  return agent;
}

export function setAgentStatus(id: string, status: AgentStatus): AgentConfig | null {
  const agent = agents.get(id);
  if (!agent) return null;
  agent.status = status;
  if (status === "live") {
    agent.lastHeartbeat = new Date().toISOString();
  }
  return agent;
}

export function recordHeartbeat(id: string): AgentConfig | null {
  const agent = agents.get(id);
  if (!agent) return null;
  agent.lastHeartbeat = new Date().toISOString();
  if (agent.status !== "live") {
    agent.status = "live";
  }
  return agent;
}

export function getAgentByApiKey(apiKey: string): AgentConfig | undefined {
  for (const agent of agents.values()) {
    if (agent.apiKey === apiKey) return agent;
  }
  return undefined;
}

export function getAgentStats(id: string): AgentStats | undefined {
  return stats.get(id);
}

export function getVault(id: string): Vault | undefined {
  return vaults.get(id);
}

export function addDeposit(
  agentId: string,
  investor: string,
  amount: number
): VaultDeposit | null {
  const vault = vaults.get(agentId);
  if (!vault) return null;

  const deposit: VaultDeposit = {
    investor,
    amount,
    depositedAt: new Date().toISOString(),
    currentValue: amount, // initially equal to deposit
  };

  vault.deposits.push(deposit);
  vault.totalDeposited += amount;
  vault.currentValue += amount;

  // Update stats AUM and investor count
  const agentStats = stats.get(agentId);
  if (agentStats) {
    agentStats.aum = vault.currentValue;
    // Count unique investors
    const uniqueInvestors = new Set(vault.deposits.map((d) => d.investor));
    agentStats.investors = uniqueInvestors.size;
  }

  return deposit;
}

export function getAgentTrades(agentId: string): Trade[] {
  return trades.get(agentId) ?? [];
}

export function getLeaderboard(): LeaderboardEntry[] {
  const allAgents = getAllAgents();

  const entries: LeaderboardEntry[] = allAgents
    .map((agent) => {
      const agentStats = stats.get(agent.id);
      if (!agentStats) return null;
      return { rank: 0, agent, stats: agentStats };
    })
    .filter((e): e is LeaderboardEntry => e !== null);

  // Sort by totalPnl descending
  entries.sort((a, b) => b.stats.totalPnl - a.stats.totalPnl);

  // Assign ranks
  entries.forEach((entry, i) => {
    entry.rank = i + 1;
  });

  return entries;
}

export function getLiveAgentCount(): number {
  let count = 0;
  for (const agent of agents.values()) {
    if (agent.status === "live") count++;
  }
  return count;
}
