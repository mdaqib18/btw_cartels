import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { parseCheckpointList } from "./checkpoint-parser";
import type { Checkpoint } from "@/lib/types";
const run = promisify(execFile);

export async function readEntireCheckpoints(): Promise<{ checkpoints: Checkpoint[]; status?: string }> {
  const cli = process.env.ENTIRE_CLI_PATH || "entire";
  try {
    // The CLI must supply source records; this adapter never manufactures checkpoint data.
    const { stdout } = await run(cli, ["checkpoints", "list", "--json"], { timeout: 12_000, maxBuffer: 2_000_000 });
    return { checkpoints: parseCheckpointList(JSON.parse(stdout)) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Entire CLI error";
    return { checkpoints: [], status: `Entire CLI not detected or unavailable: ${message}` };
  }
}
