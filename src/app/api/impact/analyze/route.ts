import { NextResponse } from "next/server";
import { analyzeGraphImpact } from "@/lib/entire-graph";
import { getCheckpoints } from "@/lib/store";
import { analyzeImpact } from "@/lib/analysis";
export async function POST(request: Request) { const { target } = await request.json() as { target?: string }; if (!target?.trim()) return NextResponse.json({ error: "target is required" }, { status: 400 }); const graph = await analyzeGraphImpact(target); return NextResponse.json({ ...analyzeImpact(target, graph.evidence, (await getCheckpoints())[0]), graphStatus: graph.status }); }
