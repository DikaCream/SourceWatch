import { CONTRACT_ADDRESS } from "../config";
import { Config, Report, Source, toInt, toStringValue } from "./types";

function objectLike(value: any): Record<string, any> {
  if (value instanceof Map) {
    const result: Record<string, any> = {};
    value.forEach((item, key) => { result[String(key)] = item; });
    return result;
  }
  return value || {};
}

function source(value: any): Source {
  const item = objectLike(value);
  return {
    id: toInt(item.id), owner: toStringValue(item.owner), label: toStringValue(item.label),
    description: toStringValue(item.description), url: toStringValue(item.url),
    baseline_hash: toStringValue(item.baseline_hash), baseline_at: toInt(item.baseline_at),
    status: toStringValue(item.status) as Source["status"], check_count: toInt(item.check_count),
    material_count: toInt(item.material_count), last_checked_at: toInt(item.last_checked_at),
    last_report_id: toInt(item.last_report_id),
  };
}

function report(value: any): Report {
  const item = objectLike(value);
  return {
    id: toInt(item.id), source_id: toInt(item.source_id), status: toStringValue(item.status) as Report["status"],
    severity: toInt(item.severity), summary: toStringValue(item.summary), changed_areas: toStringValue(item.changed_areas),
    citations: toStringValue(item.citations), snapshot: toStringValue(item.snapshot), snapshot_hash: toStringValue(item.snapshot_hash),
    created_at: toInt(item.created_at), validator_attempts: toInt(item.validator_attempts), checked_at: toInt(item.checked_at),
  };
}

function config(value: any): Config {
  const item = objectLike(value);
  return { source_count: toInt(item.source_count), report_count: toInt(item.report_count), check_interval_seconds: toInt(item.check_interval_seconds) };
}

export class SourceWatchClient {
  constructor(private client: any, private address = CONTRACT_ADDRESS) {}

  private read(name: string, args: unknown[] = []) {
    if (!this.address) throw new Error("SourceWatch contract address is not configured.");
    return this.client.readContract({ address: this.address as `0x${string}`, functionName: name, args });
  }

  private async write(name: string, args: unknown[] = []): Promise<string> {
    if (!this.address) throw new Error("SourceWatch contract address is not configured.");
    return this.client.writeContract({ address: this.address as `0x${string}`, functionName: name, args }) as Promise<string>;
  }

  async getConfig(): Promise<Config> { return config(await this.read("get_config")); }
  async getSource(id: number): Promise<Source | null> { const value = await this.read("get_source", [id]); return value == null ? null : source(value); }
  async getReport(id: number): Promise<Report | null> { const value = await this.read("get_report", [id]); return value == null ? null : report(value); }
  async listSources(offset = 0, limit = 50): Promise<Source[]> { const values = await this.read("list_sources", [offset, limit]); return Array.isArray(values) ? values.map(source) : []; }
  async listOwnerSources(owner: string, offset = 0, limit = 50): Promise<Source[]> { const values = await this.read("list_owner_sources", [owner, offset, limit]); return Array.isArray(values) ? values.map(source) : []; }
  async listReports(sourceId: number, offset = 0, limit = 50): Promise<Report[]> { const values = await this.read("list_source_reports", [sourceId, offset, limit]); return Array.isArray(values) ? values.map(report) : []; }
  async registerSource(label: string, description: string, url: string): Promise<string> { return this.write("register_source", [label, description, url]); }
  async checkSource(sourceId: number): Promise<string> { return this.write("check_source", [sourceId]); }
  async retryCheck(reportId: number): Promise<string> { return this.write("retry_check", [reportId]); }
  async pauseSource(sourceId: number): Promise<string> { return this.write("pause_source", [sourceId]); }
  async resumeSource(sourceId: number): Promise<string> { return this.write("resume_source", [sourceId]); }
  async waitForReceipt(hash: string): Promise<any> { return this.client.waitForTransactionReceipt({ hash, status: "ACCEPTED" as any, retries: 50, interval: 3000 }); }
}
