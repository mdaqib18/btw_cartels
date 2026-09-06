import { NextResponse } from "next/server";
import { buildResumePrompt, analyzeIntent } from "@/lib/analysis";
import { getCheckpoints } from "@/lib/store";
export async function POST() { const checkpoint = (await getCheckpoints())[0]; const intent = analyzeIntent(checkpoint); return NextResponse.json({ prompt: buildResumePrompt(intent, undefined, checkpoint), evidence: intent.evidence }); }
