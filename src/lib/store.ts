import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Checkpoint } from "@/lib/types";
const file = path.join(process.cwd(), ".black-box", "checkpoints.json");

export async function getCheckpoints(): Promise<Checkpoint[]> {
  try { return JSON.parse(await readFile(file, "utf8")) as Checkpoint[]; } catch { return []; }
}
export async function saveCheckpoint(checkpoint: Checkpoint): Promise<void> {
  const existing = await getCheckpoints();
  const next = [checkpoint, ...existing.filter((item) => item.checkpointId !== checkpoint.checkpointId)];
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(next, null, 2), "utf8");
}
