import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { parseCheckpointList } from "./checkpoint-parser";
import type { Checkpoint } from "@/lib/types";
const run = promisify(execFile);

export async function readEntireCheckpoints(): Promise<{ checkpoints: Checkpoint[]; status?: string }> {
  const configured = process.env.ENTIRE_CHECKPOINTS_COMMAND;
  if (!configured) return { checkpoints: [], status: "Entire checkpoint command is not configured. Set ENTIRE_CHECKPOINTS_COMMAND from your installed Entire CLI documentation." };
  try {
    const command = JSON.parse(configured) as unknown;
    if (!Array.isArray(command) || !command.length || !command.every((part) => typeof part === "string")) throw new Error("ENTIRE_CHECKPOINTS_COMMAND must be a JSON array of executable and arguments.");
    // The exact command is version-specific and supplied from the installed Entire CLI documentation.
    const { stdout } = await run(command[0], command.slice(1), { timeout: 12_000, maxBuffer: 2_000_000 });
    return { checkpoints: parseCheckpointList(JSON.parse(stdout)) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Entire CLI error";
    return { checkpoints: [], status: `Entire CLI not detected or unavailable: ${message}` };
  }
}
