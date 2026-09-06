import { NextResponse } from "next/server";
import { parseCheckpoint } from "@/lib/entire";
import { saveCheckpoint } from "@/lib/store";
import { persistDevelopmentEvent } from "@/lib/databricks";
import { sanitizeCheckpointForExternal } from "@/lib/privacy";
export async function POST(request: Request) {
  try { const checkpoint = parseCheckpoint(await request.json()); await saveCheckpoint(checkpoint); const sanitized = sanitizeCheckpointForExternal(checkpoint); const delta = await persistDevelopmentEvent(sanitized); return NextResponse.json({ checkpoint, contextStatus: sanitized.contextStatus, databricks: delta }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid checkpoint" }, { status: 400 }); }
}
