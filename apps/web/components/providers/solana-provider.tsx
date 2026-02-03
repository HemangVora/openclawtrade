"use client";

import { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";

const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";

export function SolanaProvider({ children }: { children: React.ReactNode }) {
  const endpoint = useMemo(() => SOLANA_RPC_URL, []);

  // Privy handles wallet connections, so we pass an empty wallets array.
  // External wallet adapters (Phantom, Solflare, etc.) are managed by Privy's modal.
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}
