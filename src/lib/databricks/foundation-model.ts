import { databricksConfig, databricksFetch } from "./client";
import { z } from "zod";
const report = z.object({ intentCoverage: z.number().min(0).max(100).nullable(), completed: z.array(z.string()), unfinished: z.array(z.string()), risks: z.array(z.string()), affectedComponents: z.array(z.string()), recommendedTests: z.array(z.string()), nextAction: z.string(), confidence: z.number().min(0).max(1), evidence: z.array(z.string()) });
export type ModelReport = z.infer<typeof report>;
export async function reasonWithDatabricks(evidence: unknown): Promise<{ result?: ModelReport; status?: string }> {
  const { config, missing } = databricksConfig();
  if (!config) return { status: `Databricks connection not configured. Missing: ${missing.join(", ")}` };
  try {
    const raw = await databricksFetch(`/serving-endpoints/${encodeURIComponent(config.modelEndpoint)}/invocations`, { method: "POST", body: JSON.stringify({ messages: [{ role: "system", content: "Return only valid JSON. Label only inferences; never assert unsupported facts." }, { role: "user", content: `Structured evidence:\n${JSON.stringify(evidence)}` }], response_format: { type: "json_object" } }) }) as Record<string, unknown>;
    const content = (((raw.choices as Array<Record<string, unknown>> | undefined)?.[0]?.message as Record<string, unknown> | undefined)?.content);
    return { result: report.parse(typeof content === "string" ? JSON.parse(content) : raw) };
  } catch (error) { return { status: error instanceof Error ? error.message : "Databricks reasoning failed" }; }
}
export { report as modelReportSchema };
