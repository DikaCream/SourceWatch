import type { ReportStatus } from "../lib/types";

export default function ReportBadge({ status, severity }: { status: ReportStatus; severity?: number }) {
  const label = status === "MATERIAL" ? "Material change" : status === "UNCHANGED" ? "No material change" : status === "PENDING" ? "Reviewing" : "Inconclusive";
  return <span className={`report-badge ${status.toLowerCase()}`}><span className="badge-dot" />{label}{status === "MATERIAL" && typeof severity === "number" ? <b>{severity}/10</b> : null}</span>;
}
