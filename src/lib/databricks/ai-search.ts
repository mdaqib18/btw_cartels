import { databricksConfig, databricksFetch } from "./client";
import type { Evidence } from "@/lib/types";
export async function searchDevelopmentMemory(query: string): Promise<{ evidence: Evidence[]; status?: string }> {
  const { config, missing } = databricksConfig();
  if (!config) return { evidence: [], status: `Databricks connection not configured. Missing: ${missing.join(", ")}` };
  try {
    const result = await databricksFetch(`/api/2.0/vector-search/indexes/${encodeURIComponent(config.searchEndpoint)}/query`, { method: "POST", body: JSON.stringify({ query_text: query, num_results: 5 }) }) as Record<string, unknown>;
    const rows = Array.isArray(result.result) ? result.result : Array.isArray((result.manifest as Record<string, unknown> | undefined)?.data_array) ? (result.manifest as Record<string, unknown>).data_array as unknown[] : [];
    return { evidence: rows.map((row) => ({ source: "databricks-memory" as const, claim: typeof row === "string" ? row : JSON.stringify(row) })) };
  } catch (error) { return { evidence: [], status: error instanceof Error ? error.message : "Databricks search failed" }; }
}
