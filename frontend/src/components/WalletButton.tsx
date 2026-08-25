import { useSourceWatch } from "../context/SourceWatchContext";

export default function WalletButton() {
  const { wallet } = useSourceWatch();
  if (wallet.address) return <button className="wallet-button connected" onClick={wallet.connect}><span className="online-dot" />{wallet.shortAddress}</button>;
  return <button className="button button-dark" onClick={wallet.connect} disabled={wallet.busy}>{wallet.busy ? "Connecting" : "Connect wallet"}</button>;
}
