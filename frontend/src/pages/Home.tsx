import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SourceCard from "../components/SourceCard";
import { useSourceWatch } from "../context/SourceWatchContext";
import type { Source } from "../lib/types";

export default function Home() {
  const { contract } = useSourceWatch();
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true); setError(null);
    try { setSources(await contract.listSources(0, 50)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load monitors."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, [contract]);

  async function check(id: number) {
    setChecking(id); setError(null);
    try { const tx = await contract.checkSource(id); await contract.waitForReceipt(tx); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "The check could not be submitted."); }
    finally { setChecking(null); }
  }

  const material = sources.reduce((sum, source) => sum + source.material_count, 0);
  return <div>
    <section className="hero container-wide"><div className="hero-grid"><div><div className="eyebrow"><span className="live-pulse" /> GENLAYER SEMANTIC ORACLE</div><h1>Watch what<br /><em>actually changes.</em></h1><p className="hero-copy">SourceWatch turns public web documents into an auditable change history. Validators read the page, compare meaning, and record only the changes that matter.</p><div className="hero-actions"><Link className="button button-accent" to="/register">Add a source <span>↗</span></Link><Link className="button button-quiet" to="/sources">Explore monitors</Link></div></div><div className="hero-visual"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="signal-card"><span className="signal-label">LIVE CONSENSUS</span><strong>semantic / 04</strong><div className="signal-line"><i /><i /><i /><i /><i /><i /><i /></div><span className="signal-foot">meaning over markup</span></div><div className="visual-caption">01 / MONITOR<br /><span>immutable baseline</span></div></div></div></section>
    <section className="stats-strip"><div className="container-wide stats"><div><strong>{sources.length}</strong><span>Sources watched</span></div><div><strong>{sources.reduce((sum, source) => sum + source.check_count, 0)}</strong><span>Consensus checks</span></div><div><strong className={material ? "warning-number" : ""}>{material}</strong><span>Material flags</span></div><div><strong>0</strong><span>Single operator</span></div></div></section>
    <section className="section container-wide"><div className="section-heading"><div><span className="section-index">01 / ACTIVE FEED</span><h2>Monitored sources</h2></div><Link to="/sources" className="text-button">View all <span>→</span></Link></div>{error && <div className="error-box">{error}</div>}{loading ? <div className="empty-state"><span className="loader" />Loading on-chain sources…</div> : sources.length ? <div className="source-grid">{sources.slice(0, 3).map((source) => <SourceCard key={source.id} source={source} onCheck={check} checking={checking === source.id} />)}</div> : <div className="empty-state"><span className="empty-icon">∅</span><h3>No sources yet</h3><p>Register the first public document and commit its baseline through validator consensus.</p><Link className="button button-dark" to="/register">Add your first source</Link></div>}</section>
    <section className="section section-dark"><div className="container-wide split-section"><div><span className="section-index">02 / THE DIFFERENCE</span><h2>Not every edit<br /><em>is a change.</em></h2></div><div className="principle-copy"><p>SourceWatch separates a page that changed from a page that matters differently. A timestamp moving is noise. A pricing clause changing is a signal.</p><div className="principle-list"><div><b>01</b><span>Snapshot the baseline</span></div><div><b>02</b><span>Ask independent validators</span></div><div><b>03</b><span>Record the semantic verdict</span></div></div></div></div></section>
  </div>;
}
