import { readContract as _read, writeContract as _write } from "./client";
import { CONTRACT_ADDRESS } from "../config";
import { Config, Report, Source, toInt, toStringValue } from "./types";

function O(value: any): Record<string, any> {
  if (value instanceof Map) { const r: any = {}; value.forEach((v, k) => { r[String(k)] = v; }); return r; }
  return value || {};
}

function S(value: any): Source {
  const v = O(value);
  return {
    id: toInt(v.id), owner: toStringValue(v.owner), label: toStringValue(v.label),
    description: toStringValue(v.description), url: toStringValue(v.url),
    baseline_hash: toStringValue(v.baseline_hash), baseline_at: toInt(v.baseline_at),
    status: toStringValue(v.status) as Source["status"], check_count: toInt(v.check_count),
    material_count: toInt(v.material_count), consecutive_failures: toInt(v.consecutive_failures),
    last_checked_at: toInt(v.last_checked_at),
    last_report_id: toInt(v.last_report_id),
  };
}

function R(value: any): Report {
  const v = O(value);
  return {
    id: toInt(v.id), source_id: toInt(v.source_id), status: toStringValue(v.status) as Report["status"],
    severity: toInt(v.severity), summary: toStringValue(v.summary), changed_areas: toStringValue(v.changed_areas),
    citations: toStringValue(v.citations), snapshot: toStringValue(v.snapshot), snapshot_hash: toStringValue(v.snapshot_hash),
    created_at: toInt(v.created_at), validator_attempts: toInt(v.validator_attempts), checked_at: toInt(v.checked_at),
  };
}

const ADDR = CONTRACT_ADDRESS;

async function read(name: string, args: unknown[] = []) {
  return _read(ADDR, name, args);
}

async function write(name: string, account: string, args: unknown[] = []) {
  return _write(ADDR, name, args, account);
}

export async function getConfig(): Promise<Config> { const v = O(await read("get_config")); return { source_count: toInt(v.source_count), report_count: toInt(v.report_count), check_interval_seconds: toInt(v.check_interval_seconds) }; }
export async function getSource(id: number): Promise<Source | null> { const v = await read("get_source", [id]); return v == null ? null : S(v); }
export async function getReport(id: number): Promise<Report | null> { const v = await read("get_report", [id]); return v == null ? null : R(v); }
export async function listSources(offset = 0, limit = 50): Promise<Source[]> { const v = await read("list_sources", [offset, limit]); return Array.isArray(v) ? v.map(S) : []; }
export async function listOwnerSources(owner: string, offset = 0, limit = 50): Promise<Source[]> { const v = await read("list_owner_sources", [owner, offset, limit]); return Array.isArray(v) ? v.map(S) : []; }
export async function listReports(sourceId: number, offset = 0, limit = 50): Promise<Report[]> { const v = await read("list_source_reports", [sourceId, offset, limit]); return Array.isArray(v) ? v.map(R) : []; }

// Write methods require wallet account
export async function registerSource(label: string, desc: string, url: string, account: string): Promise<string> { return write("register_source", account, [label, desc, url]); }
export async function checkSource(sourceId: number, account: string): Promise<string> { return write("check_source", account, [sourceId]); }
export async function retryCheck(reportId: number, account: string): Promise<string> { return write("retry_check", account, [reportId]); }
export async function pauseSource(sourceId: number, account: string): Promise<string> { return write("pause_source", account, [sourceId]); }
export async function resumeSource(sourceId: number, account: string): Promise<string> { return write("resume_source", account, [sourceId]); }

export { ADDR as contractAddress };