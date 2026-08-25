import { Link } from "react-router-dom";
import type { Report } from "../lib/types";
import { formatDate, formatHash } from "../lib/client";
import ReportBadge from "./ReportBadge";

export default function ReportRow({ report }: { report: Report }) {
  return <Link to={`/report/${report.id}`} className="report-row"><span className="report-id">#{String(report.id).padStart(3, "0")}</span><ReportBadge status={report.status} severity={report.severity} /><span className="report-summary">{report.summary}</span><code>{formatHash(report.snapshot_hash)}</code><time>{formatDate(report.created_at)}</time><span className="arrow">↗</span></Link>;
}
