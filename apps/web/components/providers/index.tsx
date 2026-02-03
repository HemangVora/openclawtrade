"use client";

import { PrivyAuthProvider } from "./privy-provider";
import { SolanaProvider } from "./solana-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyAuthProvider>
      <SolanaProvider>{children}</SolanaProvider>
    </PrivyAuthProvider>
  );
}
