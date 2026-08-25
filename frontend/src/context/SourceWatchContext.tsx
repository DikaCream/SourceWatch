import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createSourceWatchClient } from "../lib/client";
import { SourceWatchClient } from "../lib/contract";
import { useWallet } from "../hooks/useWallet";

interface ContextValue {
  wallet: ReturnType<typeof useWallet>;
  contract: SourceWatchClient;
}

const SourceWatchContext = createContext<ContextValue | null>(null);

export function SourceWatchProvider({ children }: { children: ReactNode }) {
  const wallet = useWallet();
  const contract = useMemo(() => new SourceWatchClient(createSourceWatchClient(wallet.address)), [wallet.address]);
  return <SourceWatchContext.Provider value={{ wallet, contract }}>{children}</SourceWatchContext.Provider>;
}

export function useSourceWatch(): ContextValue {
  const value = useContext(SourceWatchContext);
  if (!value) throw new Error("useSourceWatch must be used inside SourceWatchProvider");
  return value;
}
