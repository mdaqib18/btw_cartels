export type DatabricksConfig = { host: string; token: string; warehouseId: string; searchEndpoint: string; modelEndpoint: string; projectId: string };
export function databricksConfig(): { config?: DatabricksConfig; missing: string[] } {
  const vars = { host: process.env.DATABRICKS_HOST, token: process.env.DATABRICKS_TOKEN, warehouseId: process.env.DATABRICKS_WAREHOUSE_ID, searchEndpoint: process.env.DATABRICKS_AI_SEARCH_ENDPOINT, modelEndpoint: process.env.DATABRICKS_MODEL_ENDPOINT, projectId: process.env.DATABRICKS_PROJECT_ID };
  const names = { host: "DATABRICKS_HOST", token: "DATABRICKS_TOKEN", warehouseId: "DATABRICKS_WAREHOUSE_ID", searchEndpoint: "DATABRICKS_AI_SEARCH_ENDPOINT", modelEndpoint: "DATABRICKS_MODEL_ENDPOINT", projectId: "DATABRICKS_PROJECT_ID" } as const;
  const missing = (Object.keys(vars) as (keyof typeof vars)[]).filter((key) => !vars[key]).map((key) => names[key]);
  return missing.length ? { missing } : { config: vars as DatabricksConfig, missing: [] };
}
export async function databricksFetch(path: string, init: RequestInit = {}) {
  const { config, missing } = databricksConfig();
  if (!config) throw new Error(`Databricks connection not configured. Missing: ${missing.join(", ")}`);
  const response = await fetch(`${config.host.replace(/\/$/, "")}${path}`, { ...init, headers: { Authorization: `Bearer ${config.token}`, "Content-Type": "application/json", ...init.headers } });
  if (!response.ok) throw new Error(`Databricks request failed (${response.status}): ${await response.text()}`);
  return response.json() as Promise<unknown>;
}
