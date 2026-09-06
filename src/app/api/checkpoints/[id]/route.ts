import { NextResponse } from "next/server";
import { getCheckpoints } from "@/lib/store";
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) { const { id } = await params; const checkpoint = (await getCheckpoints()).find((item) => item.checkpointId === id); return checkpoint ? NextResponse.json({ checkpoint }) : NextResponse.json({ error: "Checkpoint not found" }, { status: 404 }); }
