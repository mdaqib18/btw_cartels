import { describe, expect, it } from "vitest";
import fixture from "./fixtures/entire-checkpoint.json";
import redactedFixture from "./fixtures/checkpoint-redacted.json";
import { parseCheckpoint } from "@/lib/entire";
import { analyzeImpact, analyzeIntent, buildResumePrompt } from "@/lib/analysis";
import { modelReportSchema } from "@/lib/databricks";
import { sanitizeCheckpointForExternal, sanitizeExternalQuery } from "@/lib/privacy";

describe("Codebase Black Box evidence pipeline", () => {
  const checkpoint = parseCheckpoint(fixture);
  it("parses checkpoint evidence without inventing fields", () => { expect(checkpoint.checkpointId).toBe("cp_12"); expect(checkpoint.assumptions).toBeNull(); expect(checkpoint.goal).toContain("Stripe"); });
  it("calculates intent coverage from explicit requirement records", () => { const report = analyzeIntent(checkpoint); expect(report.intentCoverage).toBe(50); expect(report.evidence).toHaveLength(5); });
  it("does not estimate coverage when requirements are absent", () => { expect(analyzeIntent({ ...checkpoint, completedRequirements: null, incompleteRequirements: null }).intentCoverage).toBeNull(); });
  it("normalizes graph evidence into a traceable impact result", () => { const impact = analyzeImpact("src/payment/service.ts", [{ source: "entire-graph", file: "src/payment/service.ts", relatedFile: "src/webhooks/handler.ts", relationship: "called-by", line: 12, claim: "Webhook handler calls the service." }], checkpoint); expect(impact.risk).toBe("HIGH"); expect(impact.evidence[0].source).toBe("entire-graph"); });
  it("builds an agent handoff from evidence rather than generic filler", () => { const prompt = buildResumePrompt(analyzeIntent(checkpoint), undefined, checkpoint); expect(prompt).toContain("Refund handling"); expect(prompt).toContain("Redis is used"); });
  it("validates structured Foundation Model output", () => { expect(() => modelReportSchema.parse({ intentCoverage: 50, completed: [], unfinished: [], risks: [], affectedComponents: [], recommendedTests: [], nextAction: "Inspect", confidence: 0.4, evidence: [] })).not.toThrow(); });
  it("retains useful redacted checkpoint fields without exporting raw transcript or sensitive content", () => {
    const parsed = parseCheckpoint(redactedFixture);
    const external = sanitizeCheckpointForExternal(parsed);
    expect(parsed.unavailableFields).toContain("agent conversation");
    expect(external.contextStatus).toBe("PARTIAL");
    expect(external.sessionSummary).toBeNull();
    expect(JSON.stringify(external)).not.toContain("transcript");
    expect(JSON.stringify(external)).not.toContain("[REDACTED]");
    expect(external.incompleteRequirements).toEqual(["Refund handling"]);
  });
  it("does not invent missing decisions and blocks sensitive memory searches locally", () => {
    const report = analyzeIntent(parseCheckpoint(redactedFixture));
    expect(report.contextStatus).toBe("PARTIAL");
    expect(report.decisions).toEqual([]);
    expect(sanitizeExternalQuery("password=super-secret").value).toBeUndefined();
  });
});
