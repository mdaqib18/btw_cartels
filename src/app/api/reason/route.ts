import { NextResponse } from "next/server";
import { getCheckpoints } from "@/lib/store";
import { analyzeIntent } from "@/lib/analysis";
import { reasonWithDatabricks } from "@/lib/databricks";
import { sanitizeCheckpointForExternal } from "@/lib/privacy";
export async function POST() { const checkpoint = (await getCheckpoints())[0]; const intent = analyzeIntent(checkpoint); return NextResponse.json(await reasonWithDatabricks({ checkpoint: checkpoint ? sanitizeCheckpointForExternal(checkpoint) : null, intent, instructions: "All claims must cite an input evidence item; label model conclusions as inference." })); }
