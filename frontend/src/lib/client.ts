import { createClient } from "genlayer-js";
import { studionet, localnet } from "genlayer-js/chains";
import { NETWORK, RPC_URL, STUDIONET_CHAIN_ID, STUDIONET_CHAIN_ID_HEX } from "../config";

interface Provider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on?(event: string, handler: (...args: unknown[]) => void): void;
  removeListener?(event: string, handler: (...args: unknown[]) => void): void;
}

declare global {
  interface Window { ethereum?: Provider; }
}

function provider(): Provider | null {
  return typeof window === "undefined" ? null : window.ethereum || null;
}

export function createSourceWatchClient(address?: string | null): any {
  const chain = NETWORK === "localnet" ? localnet : studionet;
  const config: Record<string, unknown> = { chain, endpoint: RPC_URL };
  if (address) config.account = address as `0x${string}`;
  return createClient(config);
}

export async function getAccounts(): Promise<string[]> {
  const wallet = provider();
  if (!wallet) return [];
  try { return (await wallet.request({ method: "eth_accounts" })) as string[]; } catch { return []; }
}

export async function connectWallet(): Promise<string> {
  const wallet = provider();
  if (!wallet) throw new Error("Install MetaMask or another EVM wallet to continue.");
  const accounts = (await wallet.request({ method: "eth_requestAccounts" })) as string[];
  if (!accounts.length) throw new Error("No wallet account was returned.");
  try {
    const chainId = String(await wallet.request({ method: "eth_chainId" }));
    if (parseInt(chainId, 16) !== STUDIONET_CHAIN_ID) {
      await wallet.request({ method: "wallet_switchEthereumChain", params: [{ chainId: STUDIONET_CHAIN_ID_HEX }] });
    }
  } catch (error: any) {
    if (error?.code === 4902) {
      await wallet.request({ method: "wallet_addEthereumChain", params: [{
        chainId: STUDIONET_CHAIN_ID_HEX,
        chainName: "GenLayer Studio",
        nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
        rpcUrls: [RPC_URL],
      }] });
    } else if (error?.code === 4001) {
      throw new Error("Network switch was cancelled.");
    }
  }
  return accounts[0];
}

export function subscribeAccounts(callback: (accounts: string[]) => void): () => void {
  const wallet = provider();
  if (!wallet?.on) return () => {};
  const handler = (...args: unknown[]) => callback((args[0] || []) as string[]);
  wallet.on("accountsChanged", handler);
  return () => wallet.removeListener?.("accountsChanged", handler);
}

export function shortAddress(address: string): string {
  return address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "";
}

export function formatDate(timestamp: number): string {
  if (!timestamp) return "Not checked yet";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(timestamp * 1000));
}

export function formatHash(hash: string): string {
  return hash ? `${hash.slice(0, 10)}…${hash.slice(-8)}` : "No hash";
}
