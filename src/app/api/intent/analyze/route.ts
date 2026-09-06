import { NextResponse } from "next/server";
import { getCheckpoints } from "@/lib/store";
import { analyzeIntent } from "@/lib/analysis";
export async function POST() { return NextResponse.json(analyzeIntent((await getCheckpoints())[0])); }
