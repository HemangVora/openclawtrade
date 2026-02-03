// Agent skill definitions
export type SkillId =
  | "swap"
  | "stake"
  | "lend"
  | "lp"
  | "snipe"
  | "sentiment"
  | "on-chain-intel"
  | "hedge";

export interface Skill {
  id: SkillId;
  name: string;
  description: string;
  icon: string;
  riskLevel: "low" | "medium" | "high" | "degen";
  protocols: string[];
}

export const SKILLS: Skill[] = [
  {
    id: "swap",
    name: "Token Swap",
    description: "Swap tokens via Jupiter aggregator for best rates across Solana DEXs",
    icon: "ArrowLeftRight",
    riskLevel: "low",
    protocols: ["Jupiter", "Raydium"],
  },
  {
    id: "stake",
    name: "Liquid Staking",
    description: "Stake SOL for yield via liquid staking protocols",
    icon: "Layers",
    riskLevel: "low",
    protocols: ["Marinade", "Jito"],
  },
  {
    id: "lend",
    name: "Lending",
    description: "Lend and borrow assets for yield or leverage",
    icon: "Landmark",
    riskLevel: "medium",
    protocols: ["MarginFi", "Kamino"],
  },
  {
    id: "lp",
    name: "Liquidity Provision",
    description: "Provide liquidity to DEX pools and earn trading fees",
    icon: "Droplets",
    riskLevel: "medium",
    protocols: ["Orca", "Raydium"],
  },
  {
    id: "snipe",
    name: "Token Sniper",
    description: "Detect and snipe new token launches on Solana",
    icon: "Crosshair",
    riskLevel: "degen",
    protocols: ["Pump.fun", "Raydium"],
  },
  {
    id: "sentiment",
    name: "Sentiment Analysis",
    description: "Analyze Moltbook agent discussions and social signals for alpha",
    icon: "Brain",
    riskLevel: "low",
    protocols: ["Moltbook", "X/Twitter"],
  },
  {
    id: "on-chain-intel",
    name: "On-Chain Intelligence",
    description: "Track whale wallets, token flows, and DEX volume anomalies",
    icon: "Eye",
    riskLevel: "low",
    protocols: ["Helius", "Birdeye"],
  },
  {
    id: "hedge",
    name: "Hedge Positions",
    description: "Open short positions or buy puts to hedge downside risk",
    icon: "Shield",
    riskLevel: "high",
    protocols: ["Drift", "Zeta"],
  },
];

// Agent types
export type AgentStrategy = "momentum" | "arbitrage" | "sentiment" | "degen" | "conservative" | "custom";

export type AgentStatus = "live" | "stopped" | "error" | "deploying";

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  creator: string;
  strategy: AgentStrategy;
  skills: SkillId[];
  status: AgentStatus;
  apiKey: string;
  walletAddress: string;
  lastHeartbeat: string | null;
  allowedTokens: string[];
  createdAt: string;
  verified: boolean;
}

export interface AgentStats {
  agentId: string;
  totalPnl: number;
  pnlPercentage: number;
  winRate: number;
  totalTrades: number;
  maxDrawdown: number;
  sharpeRatio: number;
  aum: number; // assets under management in SOL
  investors: number;
  uptime: number; // percentage
  lastTradeAt: string;
}

export interface Vault {
  agentId: string;
  totalDeposited: number;
  currentValue: number;
  profitSplit: {
    investor: number;
    creator: number;
    platform: number;
  };
  deposits: VaultDeposit[];
}

export interface VaultDeposit {
  investor: string;
  amount: number;
  depositedAt: string;
  currentValue: number;
}

export interface Trade {
  id: string;
  agentId: string;
  skill: SkillId;
  action: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
  amountOut: number;
  pnl: number;
  timestamp: string;
  txSignature: string;
}

export interface LeaderboardEntry {
  rank: number;
  agent: AgentConfig;
  stats: AgentStats;
}
