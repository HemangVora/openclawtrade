/**
 * Privy Server Wallet integration for agent trading
 * Uses Model 1: Agent-Controlled, Developer-Owned wallets
 */

interface PrivyWalletConfig {
  appId: string;
  appSecret: string;
  authorizationKeyId?: string;
  policyIds?: string[];
}

interface TransactionRequest {
  to: string;
  data?: string;
  value?: string;
  chain?: string;
}

export class PrivyWallet {
  private config: PrivyWalletConfig;
  private walletId: string | null = null;
  private walletAddress: string | null = null;

  constructor(config?: Partial<PrivyWalletConfig>) {
    this.config = {
      appId: config?.appId || process.env.NEXT_PUBLIC_PRIVY_APP_ID || "",
      appSecret: config?.appSecret || process.env.PRIVY_APP_SECRET || "",
      authorizationKeyId: config?.authorizationKeyId,
      policyIds: config?.policyIds,
    };
  }

  /**
   * Create a new server-controlled wallet for an agent
   */
  async createWallet(agentId: string): Promise<{ walletId: string; address: string }> {
    const res = await fetch("https://api.privy.io/v1/wallets", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${this.config.appId}:${this.config.appSecret}`).toString("base64")}`,
        "privy-app-id": this.config.appId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chain_type: "solana",
        wallet_type: "server",
        owner_id: this.config.authorizationKeyId,
        policy_ids: this.config.policyIds,
        metadata: { agent_id: agentId },
      }),
    });

    const data = await res.json();
    this.walletId = data.id;
    this.walletAddress = data.address;

    console.log(`[privy] created wallet ${data.address} for agent ${agentId}`);
    return { walletId: data.id, address: data.address };
  }

  /**
   * Sign and send a Solana transaction
   */
  async sendTransaction(transaction: string): Promise<string> {
    if (!this.walletId) throw new Error("Wallet not initialized");

    const res = await fetch(`https://api.privy.io/v1/wallets/${this.walletId}/rpc`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${this.config.appId}:${this.config.appSecret}`).toString("base64")}`,
        "privy-app-id": this.config.appId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        method: "signAndSendTransaction",
        params: { transaction },
      }),
    });

    const data = await res.json();
    console.log(`[privy] tx sent: ${data.hash}`);
    return data.hash;
  }

  getAddress(): string | null {
    return this.walletAddress;
  }
}
