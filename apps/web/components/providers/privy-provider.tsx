"use client";

import { createContext, useContext } from "react";
import { PrivyProvider as BasePrivyProvider } from "@privy-io/react-auth";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

const PrivyReadyContext = createContext(false);

export function usePrivyReady() {
  return useContext(PrivyReadyContext);
}

export function PrivyAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Skip Privy when no app ID is configured (allows build to succeed)
  if (!PRIVY_APP_ID) {
    return (
      <PrivyReadyContext.Provider value={false}>
        {children}
      </PrivyReadyContext.Provider>
    );
  }

  return (
    <PrivyReadyContext.Provider value={true}>
      <BasePrivyProvider
        appId={PRIVY_APP_ID}
        config={{
          appearance: {
            theme: "dark",
            accentColor: "#00ff88",
            walletChainType: "solana-only",
          },
          loginMethods: ["wallet"],
          embeddedWallets: {
            solana: {
              createOnLogin: "users-without-wallets",
            },
          },
        }}
      >
        {children}
      </BasePrivyProvider>
    </PrivyReadyContext.Provider>
  );
}
