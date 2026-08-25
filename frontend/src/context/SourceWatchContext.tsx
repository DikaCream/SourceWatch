import { createContext, useContext, type ReactNode } from "react";
import { useWallet } from "../hooks/useWallet";

interface Ctx {
  wallet: ReturnType<typeof useWallet>;
}

const C = createContext<Ctx | null>(null);

export function SourceWatchProvider({ children }: { children: ReactNode }) {
  const wallet = useWallet();
  return <C.Provider value={{ wallet }}>{children}</C.Provider>;
}

export function useSourceWatch(): Ctx {
  const v = useContext(C);
  if (!v) throw new Error("useSourceWatch inside SourceWatchProvider");
  return v;
}