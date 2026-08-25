import { useEffect, useState } from "react";
import { connectWallet, getAccounts, shortAddress, subscribeAccounts } from "../lib/client";

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAccounts().then((accounts) => setAddress(accounts[0] || null));
    return subscribeAccounts((accounts) => setAddress(accounts[0] || null));
  }, []);

  async function connect() {
    setBusy(true);
    setError(null);
    try { setAddress(await connectWallet()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Wallet connection failed."); }
    finally { setBusy(false); }
  }

  return { address, shortAddress: address ? shortAddress(address) : "", busy, error, connect };
}
