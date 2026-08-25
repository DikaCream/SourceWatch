import { Link } from "react-router-dom";
import type { Source } from "../lib/types";
import { formatDate, formatHash } from "../lib/client";

export default function SourceCard({ source, onCheck, checking }: { source: Source; onCheck: (id: number) => void; checking: boolean }) {
  return (
    <article className="source-card">
      <div className="card-topline"><span className={`source-status ${source.status.toLowerCase()}`}>{source.status.toLowerCase()}</span><span className="source-number">#{String(source.id).padStart(2, "0")}</span></div>
      <Link to={`/source/${source.id}`} className="card-title">{source.label}</Link>
      <p className="card-description">{source.description}</p>
      <div className="card-url"><span className="url-dot" />{source.url.replace(/^https?:\/\//, "")}</div>
      <div className="card-metrics"><span><small>baseline</small><code>{formatHash(source.baseline_hash)}</code></span><span><small>checks</small><b>{source.check_count}</b></span><span><small>flags</small><b className={source.material_count ? "warn-text" : ""}>{source.material_count}</b></span></div>
      <div className="card-footer"><span className="last-seen">{formatDate(source.last_checked_at)}</span><button className="text-button" onClick={() => onCheck(source.id)} disabled={checking || source.status !== "ACTIVE"}>{checking ? "Checking…" : "Check now →"}</button></div>
    </article>
  );
}
