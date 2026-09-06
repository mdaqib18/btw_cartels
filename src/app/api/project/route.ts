import { NextResponse } from "next/server";
import { getCheckpoints } from "@/lib/store";
import { analyzeIntent } from "@/lib/analysis";
import { databricksConfig } from "@/lib/databricks";
export async function GET() {
  const checkpoints = await getCheckpoints(); const latest = checkpoints[0]; const intent = analyzeIntent(latest);
  const db = databricksConfig();
  return NextResponse.json({ project: process.env.DATABRICKS_PROJECT_ID || "Local project", latestCheckpoint: latest?.checkpointId || null, checkpointCount: checkpoints.length, intent, integrations: { entire: "Refresh to detect Entire CLI", databricks: db.config ? "configured" : `missing ${db.missing.join(", ")}` } });
}
