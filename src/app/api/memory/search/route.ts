import { NextResponse } from "next/server";
import { searchDevelopmentMemory } from "@/lib/databricks";
export async function POST(request: Request) { const { query } = await request.json() as { query?: string }; if (!query?.trim()) return NextResponse.json({ error: "query is required" }, { status: 400 }); return NextResponse.json(await searchDevelopmentMemory(query)); }
