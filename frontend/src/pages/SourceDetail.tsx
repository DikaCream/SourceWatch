import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReportBadge from "../components/ReportBadge";
import ReportRow from "../components/ReportRow";
import { formatDate, formatHash } from "../lib/client";
import { useSourceWatch } from "../context/SourceWatchContext";
import { getSource, listReports, checkSource } from "../lib/contract";
import type { Report, Source } from "../lib/types";

export default function SourceDetail() {
  const { id } = useParams(); const sid = Number(id); const { wallet } = useSourceWatch();
  const [source, setSource] = useState<Source | null>(null); const [reports, setReports] = useState<Report[]>([]);
  const [busy, setBusy] = useState(true); const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null); const [msg, setMsg] = useState<string | null>(null);

  async function load() { setBusy(true); try { setSource(await getSource(sid)); setReports((await listReports(sid)).reverse()); } catch (e: any) { setError(e.message); } finally { setBusy(false); } }
  useEffect(() => { load(); }, [sid]);

  async function check() { if (!wallet.address) { await wallet.connect(); return; } setChecking(true); setError(null); setMsg("Validators reading the page…"); try { await checkSource(sid, wallet.address); setMsg("Report finalized."); await load(); } catch (e: any) { setError(e.message); setMsg(null); } finally { setChecking(false); } }

  if (busy) return <div className="loading-screen"><span className="loader" />Reading source…</div>;
  if (!source) return <div className="container-narrow page"><div className="empty-state"><span className="empty-icon">?</span><h3>Source not found</h3><Link to="/sources" className="button button-dark">Back to monitors</Link></div></div>;

  return <div className="container-wide page">
    <Link to="/sources" className="back-link">← All monitors</Link>
    <div className="detail-header"><div>
      <div className="card-topline"><span className={`source-status ${source.status.toLowerCase()}`}>{source.status.toLowerCase()}</span><span className="source-number">SOURCE #{String(source.id).padStart(2, "0")}</span></div>
      <h1>{source.label}</h1><p>{source.description}</p>
      <a className="source-link" href={source.url} target="_blank" rel="noreferrer">{source.url} ↗</a>
    </div>
    <button className="button button-accent" onClick={check} disabled={checking || source.status !== "ACTIVE"}>{checking ? "Checking…" : wallet.address ? "Check now" : "Connect to check"}</button></div>
    {error && <div className="error-box">{error}</div>}{msg && <div className="status-box"><span className="check-mark">✓</span>{msg}</div>}
    <section className="identity-grid">
      <div className="identity-card"><span className="section-index">BASELINE IDENTITY</span><code className="identity-hash">{source.baseline_hash}</code><span>Committed {formatDate(source.baseline_at)}</span></div>
      <div className="identity-card"><span className="section-index">WATCH STATS</span><div className="watch-stat"><strong>{source.check_count}</strong><span>checks</span></div><div className="watch-stat"><strong className={source.material_count ? "warning-number" : ""}>{source.material_count}</strong><span>material</span></div></div>
      <div className="identity-card"><span className="section-index">LATEST CHECK</span>{source.last_report_id ? <Link to={`/report/${source.last_report_id}`} className="latest-report"><ReportBadge status={reports[0]?.status || "PENDING"} severity={reports[0]?.severity} /><span>{formatDate(source.last_checked_at)}</span></Link> : <span className="muted">No check yet.</span>}</div>
    </section>
    <section className="reports-section"><div className="section-heading"><div><span className="section-index">REPORT LOG / {String(reports.length).padStart(2, "0")}</span><h2>Change history</h2></div></div>{reports.length ? <div className="report-list">{reports.map((r) => <ReportRow report={r} key={r.id} />)}</div> : <div className="empty-state small-empty"><p>No reports yet.</p></div>}</section>
    <section className="source-footer-note"><span>Baseline {formatHash(source.baseline_hash)}</span><span>Owner {formatHash(source.owner)}</span><span>Last checked {formatDate(source.last_checked_at)}</span></section>
  </div>;
}