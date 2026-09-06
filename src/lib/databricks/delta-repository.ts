import type { Checkpoint } from "@/lib/types";
import { databricksConfig, databricksFetch } from "./client";
const esc = (value: string | null) => value === null ? "NULL" : `'${value.replace(/'/g, "''")}'`;
const json = (value: unknown) => esc(value === null ? null : JSON.stringify(value));

export async function persistDevelopmentEvent(checkpoint: Checkpoint, graphImpact: unknown = null) {
  const { config, missing } = databricksConfig();
  if (!config) return { ok: false, status: `Databricks connection not configured. Missing: ${missing.join(", ")}` };
  const values = [checkpoint.checkpointId, config.projectId, checkpoint.timestamp, checkpoint.goal, json(checkpoint.decisions), json(checkpoint.assumptions), json(checkpoint.completedRequirements), json(checkpoint.incompleteRequirements), json(checkpoint.risks), json(checkpoint.filesChanged), json(checkpoint.testsRun), json(checkpoint.testResults), checkpoint.agent, checkpoint.sessionSummary, json(graphImpact), checkpoint.sourceCommit].map((value) => typeof value === "string" && !value.startsWith("'") && value !== "NULL" ? esc(value) : value).join(",");
  const statement = `INSERT INTO codebase_black_box.development_events (checkpoint_id,project_id,timestamp,goal,decisions,assumptions,completed_requirements,unfinished_requirements,risks,files_changed,tests_run,test_results,agent,session_summary,graph_impact,source_commit) VALUES (${values})`;
  await databricksFetch("/api/2.0/sql/statements", { method: "POST", body: JSON.stringify({ statement, warehouse_id: config.warehouseId, wait_timeout: "30s" }) });
  return { ok: true };
}
