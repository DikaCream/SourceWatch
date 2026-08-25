import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSourceWatch } from "../context/SourceWatchContext";
import { registerSource, listOwnerSources } from "../lib/contract";

export default function Register() {
  const { wallet } = useSourceWatch();
  const navigate = useNavigate();
  const [label, setLabel] = useState(""); const [description, setDescription] = useState(""); const [url, setUrl] = useState(""); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState<string | null>(null); const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) { e.preventDefault(); setError(null); setMsg(null);
    if (!wallet.address) { await wallet.connect(); return; }
    if (label.trim().length < 3 || description.trim().length < 20 || !url.startsWith("https://")) { setError("Label min 3 chars, description min 20 chars, URL must be https."); return; }
    setBusy(true); setMsg("Submitting for baseline consensus…");
    try { await registerSource(label.trim(), description.trim(), url.trim()); setMsg("Baseline committed!"); const srcs = await listOwnerSources(wallet.address!); const newest = srcs[srcs.length - 1]; if (newest) navigate(`/source/${newest.id}`); }
    catch (e: any) { setError(e.message || "Registration failed."); setMsg(null); }
    finally { setBusy(false); }
  }

  return <div className="container-narrow page">
    <Link to="/sources" className="back-link">← Back to monitors</Link>
    <div className="page-heading compact"><div><span className="section-index">REGISTER / NEW SOURCE</span><h1>Put a document<br /><em>under watch.</em></h1><p>SourceWatch will fetch the page through GenLayer validators and commit the exact baseline they agree on.</p></div></div>
    <div className="register-layout">
      <form className="register-form" onSubmit={submit}>
        <label>Source label<input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Acme API pricing" maxLength={80} /></label>
        <label>What should watchers understand?<textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Monitor pricing, usage limits, and availability changes." rows={4} maxLength={1000} /><small>{description.length} / 1000</small></label>
        <label>Public HTTPS URL<input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://docs.example.com/pricing" type="url" /></label>
        {error && <div className="error-box">{error}</div>}
        {msg && <div className="status-box"><span className={busy ? "loader small-loader" : "check-mark"}>{busy ? "" : "✓"}</span>{msg}</div>}
        <button className="button button-accent full-button" disabled={busy}>{busy ? "Waiting for consensus…" : wallet.address ? "Commit baseline" : "Connect wallet to continue"}</button>
      </form>
      <aside className="register-note">
        <span className="section-index">WHAT GETS COMMITTED</span>
        <div className="note-step"><b>01</b><span><strong>Exact text snapshot</strong><small>The text validators actually read.</small></span></div>
        <div className="note-step"><b>02</b><span><strong>Keccak-256 hash</strong><small>A compact identity for the baseline.</small></span></div>
        <div className="note-step"><b>03</b><span><strong>Semantic history</strong><small>Future checks compare meaning.</small></span></div>
      </aside>
    </div>
  </div>;
}