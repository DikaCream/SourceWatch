import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SourceCard from "../components/SourceCard";
import { listSources, checkSource } from "../lib/contract";
import { useSourceWatch } from "../context/SourceWatchContext";
import type { Source } from "../lib/types";

export default function Home() {
  const { wallet } = useSourceWatch();
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() { setLoading(true); setError(null); try { setSources(await listSources()); } catch (e: any) { setError(e.message || "Could not load monitors."); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);

  async function check(id: number) {
    if (!wallet.address) { await wallet.connect(); return; }
    setChecking(id); setError(null);
    try { await checkSource(id, wallet.address); await load(); }
    catch (e: any) { setError(e.message || "Check failed."); }
    finally { setChecking(null); }
  }

  const material = sources.reduce((sum, s) => sum + s.material_count, 0);
  return <div>
    <section className="hero container-wide"><div className="hero-grid"><div><div className="eyebrow"><span className="live-pulse" />GENLAYER SEMANTIC ORACLE</div><h1>Watch what<br /><em>actually changes.</em></h1><p className="hero-copy">SourceWatch turns public web documents into an auditable change history. Validators read the page, compare meaning, and record only the changes that matter.</p><div className="hero-actions"><Link className="button button-accent" to="/register">Add a source</Link><Link className="button button-quiet" to="/sources">Explore monitors</Link></div></div><div className="hero-visual"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="signal-card"><span className="signal-label">LIVE CONSENSUS</span><strong>semantic / 04</strong><div className="signal-line"><i /><i /><i /><i /><i /><i /><i /></div><span className="signal-foot">meaning over markup</span></div></div></div></section>
    <section className="stats-strip"><div className="container-wide stats"><div><strong>{sources.length}</strong><span>Sources watched</span></div><div><strong>{sources.reduce((sum, s) => sum + s.check_count, 0)}</strong><span>Consensus checks</span></div><div><strong className={material ? "warning-number" : ""}>{material}</strong><span>Material flags</span></div></div></section>
    <section className="section container-wide"><div className="section-heading"><div><span className="section-index">ACTIVE FEED</span><h2>Monitored sources</h2></div><Link to="/sources" className="text-button">View all →</Link></div>{error && <div className="error-box">{error}</div>}{loading ? <div className="empty-state"><span className="loader" />Loading on-chain sources…</div> : sources.length ? <div className="source-grid">{sources.slice(0, 3).map((s) => <SourceCard key={s.id} source={s} onCheck={check} checking={checking === s.id} />)}</div> : <div className="empty-state"><span className="empty-icon">∅</span><h3>No sources yet</h3><p>Register the first public document and commit its baseline through validator consensus.</p><Link className="button button-dark" to="/register">Add your first source</Link></div>}</section>
    <section className="section section-dark"><div className="container-wide split-section"><div><span className="section-index">THE DIFFERENCE</span><h2>Not every edit<br /><em>is a change.</em></h2></div><div className="principle-copy"><p>SourceWatch separates a page that changed from a page that matters differently. A timestamp moving is noise. A pricing clause changing is a signal.</p><div className="principle-list"><div><b>01</b><span>Snapshot the baseline</span></div><div><b>02</b><span>Ask independent validators</span></div><div><b>03</b><span>Record the semantic verdict</span></div></div></div></div></section>
  </div>;
}