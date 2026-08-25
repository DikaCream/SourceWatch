import { RPC_URL, STUDIONET_CHAIN_ID, STUDIONET_CHAIN_ID_HEX } from "../config";

let _clientPromise: Promise<any> | null = null;
let _studionetPromise: Promise<any> | null = null;

async function getGlClient() {
  if (!_clientPromise) _clientPromise = import("genlayer-js").then((m) => m.createClient);
  if (!_studionetPromise) _studionetPromise = import("genlayer-js/chains").then((m) => m.studionet);
  const [createClient, studionet] = await Promise.all([_clientPromise, _studionetPromise]);
  return { createClient, studionet };
}

/* ── Wallet helpers ───────────────────────────────────── */

interface Provider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on?(event: string, handler: (...args: unknown[]) => void): void;
  removeListener?(event: string, handler: (...args: unknown[]) => void): void;
}
declare global { interface Window { ethereum?: Provider } }

function provider(): Provider | null {
  return typeof window === "undefined" ? null : window.ethereum || null;
}

export async function getAccounts(): Promise<string[]> {
  const w = provider();
  if (!w) return [];
  try { return (await w.request({ method: "eth_accounts" })) as string[]; } catch { return []; }
}

export async function connectWallet(): Promise<string> {
  const w = provider();
  if (!w) throw new Error("Install MetaMask or another EVM wallet to continue.");
  const accounts = (await w.request({ method: "eth_requestAccounts" })) as string[];
  if (!accounts.length) throw new Error("No wallet account was returned.");
  try {
    const cid = String(await w.request({ method: "eth_chainId" }));
    if (parseInt(cid, 16) !== STUDIONET_CHAIN_ID) {
      await w.request({ method: "wallet_switchEthereumChain", params: [{ chainId: STUDIONET_CHAIN_ID_HEX }] });
    }
  } catch (e: any) {
    if (e?.code === 4902) {
      await w.request({ method: "wallet_addEthereumChain", params: [{
        chainId: STUDIONET_CHAIN_ID_HEX, chainName: "GenLayer Studio",
        nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 }, rpcUrls: [RPC_URL],
      }] });
    } else if (e?.code === 4001) throw new Error("Network switch was cancelled.");
    else throw e;
  }
  return accounts[0];
}

export function subscribeAccounts(cb: (accounts: string[]) => void): () => void {
  const w = provider();
  if (!w?.on) return () => {};
  const h = (...a: unknown[]) => cb((a[0] || []) as string[]);
  w.on("accountsChanged", h);
  return () => w.removeListener?.("accountsChanged", h);
}

/* ── Contract calls ───────────────────────────────────── */

export async function createContractClient(walletAccount: string | null) {
  const { createClient, studionet } = await getGlClient();
  return createClient({
    chain: studionet,
    endpoint: RPC_URL,
    ...(walletAccount ? { account: walletAccount as `0x${string}` } : {}),
  });
}

export async function readContract(address: string, fnName: string, args: unknown[] = []) {
  const client = await createContractClient(null);
  return client.readContract({ address: address as `0x${string}`, functionName: fnName, args });
}

export async function writeContract(address: string, fnName: string, args: unknown[] = []) {
  const client = await createContractClient(null);
  return client.writeContract({ address: address as `0x${string}`, functionName: fnName, args }) as Promise<string>;
}

/* ── Utility ──────────────────────────────────────────── */

export function shortAddress(a: string) { return a ? `${a.slice(0, 6)}…${a.slice(-4)}` : ""; }
export function formatDate(ts: number) {
  if (!ts) return "Not checked yet";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(ts * 1000));
}
export function formatHash(h: string) { return h ? `${h.slice(0, 10)}…${h.slice(-8)}` : "No hash"; }