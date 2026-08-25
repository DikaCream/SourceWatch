function env(name: string, fallback: string): string {
  const value = import.meta.env[name] as string | undefined;
  return (value || fallback).trim();
}

export const CONTRACT_ADDRESS = env("VITE_CONTRACT_ADDRESS", "");
export const NETWORK = env("VITE_GENLAYER_NETWORK", "studionet");
export const RPC_URL = env("VITE_GENLAYER_RPC_URL", "https://studio.genlayer.com/api");
export const STUDIONET_CHAIN_ID = 61999;
export const STUDIONET_CHAIN_ID_HEX = "0xF23F";
export const EXPLORER_URL = "https://explorer-studio.genlayer.com/address/";
