import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReportBadge from "../components/ReportBadge";
import { formatDate } from "../lib/client";
import { getReport, getSource } from "../lib/contract";
import type { Report, Source } from "../lib/types";

export default function ReportDetail() {
  const { id } = useParams(); const rid = Number(id);
  const [report, setReport] = useState<Report | null>(null); const [source, setSource] = useState<Source | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getReport(rid).then(async (r) => { setReport(r); if (r) setSource(await getSource(r.source_id)); }).catch((e: any) => setError(e.message));
  }, [rid]);

  if (error) return <div className="container-narrow page"><div className="error-box">{error}</div></div>;
  if (!report) return <div className="loading-screen"><span className="loader" />Reading report…</div>;

  return <div className="container-narrow page">
    <Link to={source ? `/source/${source.id}` : "/sources"} className="back-link">← {source ? source.label : "All monitors"}</Link>
    <div className="report-detail-head"><span className="section-index">REPORT #{String(report.id).padStart(3, "0")} / {formatDate(report.created_at)}</span><h1>{report.status === "MATERIAL" ? "A meaningful change." : report.status === "UNCHANGED" ? "No material change." : "Review in progress."}</h1><ReportBadge status={report.status} severity={report.severity} /></div>
    <div className="verdict-panel"><span className="section-index">VALIDATOR SUMMARY</span><p className="verdict-summary">{report.summary}</p>{report.changed_areas && <div className="detail-block"><span>Changed areas</span><strong>{report.changed_areas}</strong></div>}{report.citations && <div className="detail-block"><span>Evidence</span><blockquote>{report.citations}</blockquote></div>}</div>
    <div className="hash-panel"><div><span className="section-index">SNAPSHOT HASH</span><code>{report.snapshot_hash || "Pending"}</code></div><div><span className="section-index">ATTEMPTS</span><strong>{report.validator_attempts}</strong></div><div><span className="section-index">CHECKED AT</span><strong>{formatDate(report.checked_at)}</strong></div></div>
    {report.snapshot && <details className="snapshot-details"><summary>Read current snapshot</summary><pre>{report.snapshot}</pre></details>}
    <div className="report-disclaimer">This report records a semantic judgment by GenLayer validators.</div>
  </div>;
}