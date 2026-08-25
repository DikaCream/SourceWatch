export type SourceStatus = "ACTIVE" | "PAUSED";
export type ReportStatus = "PENDING" | "UNCHANGED" | "MATERIAL" | "INCONCLUSIVE";

export interface Source {
  id: number;
  owner: string;
  label: string;
  description: string;
  url: string;
  baseline_hash: string;
  baseline_at: number;
  status: SourceStatus;
  check_count: number;
  material_count: number;
  last_checked_at: number;
  last_report_id: number;
}

export interface Report {
  id: number;
  source_id: number;
  status: ReportStatus;
  severity: number;
  summary: string;
  changed_areas: string;
  citations: string;
  snapshot: string;
  snapshot_hash: string;
  created_at: number;
  validator_attempts: number;
  checked_at: number;
}

export interface Config {
  source_count: number;
  report_count: number;
  check_interval_seconds: number;
}

export function toInt(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string") return Number(value);
  return 0;
}

export function toStringValue(value: unknown): string {
  return value == null ? "" : String(value);
}
