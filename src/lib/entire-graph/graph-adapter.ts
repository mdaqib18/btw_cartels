import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { GraphEvidence } from "@/lib/types";
const run = promisify(execFile);

function toEvidence(value: unknown, fallback: string): GraphEvidence[] {
  const values: unknown[] = Array.isArray(value) ? value : value && typeof value === "object" && Array.isArray((value as Record<string, unknown>).results) ? (value as Record<string, unknown>).results as unknown[] : [];
  return values.filter((item): item is Record<string, unknown> => !!item && typeof item === "object").map((item) => ({
    source: "entire-graph", file: typeof item.file === "string" ? item.file : fallback,
    line: typeof item.line === "number" ? item.line : null, relationship: typeof item.relationship === "string" ? item.relationship : "related-to",
    relatedFile: typeof item.relatedFile === "string" ? item.relatedFile : typeof item.path === "string" ? item.path : null,
    claim: typeof item.reason === "string" ? item.reason : "Relationship returned by Entire Graph."
  }));
}
export async function analyzeGraphImpact(target: string): Promise<{ evidence: GraphEvidence[]; status?: string }> {
  try {
    const cli = process.env.ENTIRE_CLI_PATH || "entire";
    const { stdout } = await run(cli, ["graph", "impact", target, "--json"], { timeout: 12_000, maxBuffer: 2_000_000 });
    return { evidence: toEvidence(JSON.parse(stdout), target) };
  } catch (error) {
    return { evidence: [], status: `Entire Graph unavailable: ${error instanceof Error ? error.message : "unknown error"}` };
  }
}

export async function searchGraph(query: string) { return analyzeGraphImpact(query); }
export async function lookupDefinition(symbol: string) { return analyzeGraphImpact(symbol); }
export async function lookupRelationships(target: string) { return analyzeGraphImpact(target); }
