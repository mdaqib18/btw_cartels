import { NextResponse } from "next/server";
import { readEntireCheckpoints } from "@/lib/entire";
import { saveCheckpoint } from "@/lib/store";
import { persistDevelopmentEvent } from "@/lib/databricks";
import { sanitizeCheckpointForExternal } from "@/lib/privacy";
export async function POST() { const result = await readEntireCheckpoints(); for (const checkpoint of result.checkpoints) { await saveCheckpoint(checkpoint); await persistDevelopmentEvent(sanitizeCheckpointForExternal(checkpoint)); } return NextResponse.json(result); }
