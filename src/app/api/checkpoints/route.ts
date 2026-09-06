import { NextResponse } from "next/server";
import { getCheckpoints } from "@/lib/store";
export async function GET() { return NextResponse.json({ checkpoints: await getCheckpoints() }); }
