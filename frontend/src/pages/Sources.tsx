import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SourceCard from "../components/SourceCard";
import { listSources, checkSource } from "../lib/contract";
import { useSourceWatch } from "../context/SourceWatchContext";
import type { Source } from "../lib/types";

export default function Sources() {
  const { wallet } = useSourceWatch();
  const [sources, setSources] = useState<Source[]>([]);
  const [query, setQuery] = useState("");
  const [checking, setChecking] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() { setLoading(true); setError(null); try { setSources(await listSources()); } catch (e: any) { setError(e.message || "Could not load."); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);

  async function check(id: number) {
    if (!wallet.address) { await wallet.connect(); return; }
    setChecking(id); setError(null);
    try { await checkSource(id, wallet.address); await load(); }
    catch (e: any) { setError(e.message || "Check failed."); }
    finally { setChecking(null); }
  }

  const filtered = useMemo(() => sources.filter((s) => `${s.label} ${s.description} ${s.url}`.toLowerCase().includes(query.toLowerCase())), [sources, query]);

  return (
    <div className="container-wide page">
      <div className="page-heading">
        <div>
          <span className="section-index">SOURCE INDEX / {String(sources.length).padStart(2, "0")}</span>
          <h1>Monitors</h1>
          <p>Public sources with an immutable baseline and a validator-written change history.</p>
        </div>
        <Link to="/register" className="button button-accent">+ Add source</Link>
      </div>
      <div className="filter-bar">
        <div className="search-field"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search sources" /></div>
        <span className="filter-note">{filtered.length} visible</span>
      </div>
      {error && <div className="error-box">{error}</div>}
      {loading && (
        <div className="empty-state"><span className="loader" />Reading SourceWatch…</div>
      )}
      {!loading && filtered.length > 0 && (
        <div className="source-grid source-grid-wide">
          {filtered.map((s) => <SourceCard key={s.id} source={s} onCheck={check} checking={checking === s.id} />)}
        </div>
      )}
      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">⌕</span>
          <h3>{sources.length ? "No matching sources" : "The index is empty"}</h3>
          <p>{sources.length ? "Try another label or URL." : "Add a public document to start a shared change history."}</p>
          {!sources.length && <Link className="button button-dark" to="/register">Add source</Link>}
        </div>
      )}
    </div>
  );
}