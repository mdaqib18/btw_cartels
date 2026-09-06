import { z } from "zod";
import type { Checkpoint } from "@/lib/types";

const rawCheckpoint = z.object({}).passthrough();
const list = (value: unknown): string[] | null => Array.isArray(value) ? value.filter((x): x is string => typeof x === "string" && x.trim().length > 0) : null;
const string = (value: unknown): string | null => typeof value === "string" && value.trim() ? value : null;
const first = (object: Record<string, unknown>, ...keys: string[]) => keys.map((key) => object[key]).find((value) => value !== undefined);
const unavailable = (record: Record<string, unknown>, nested: Record<string, unknown>, keys: string[], label: string) => {
  const value = first(record, ...keys) ?? first(nested, ...keys);
  return value === null || value === undefined || (typeof value === "string" && /\[\s*redacted\s*\]/i.test(value)) ? [label] : [];
};

/** Converts actual Entire JSON into an intentionally lossless, null-tolerant record. */
export function parseCheckpoint(value: unknown): Checkpoint {
  const record = rawCheckpoint.parse(value);
  const nested = (record.context && typeof record.context === "object" ? record.context : {}) as Record<string, unknown>;
  const get = (...keys: string[]) => first(record, ...keys) ?? first(nested, ...keys);
  const identifier = string(get("checkpointId", "checkpoint_id", "id"));
  if (!identifier) throw new Error("Checkpoint has no identifier; refusing to invent one.");
  const unavailableFields = [
    ...unavailable(record, nested, ["goal", "intent", "originalGoal"], "goal"),
    ...unavailable(record, nested, ["completedRequirements", "completed_requirements", "completed"], "completed requirements"),
    ...unavailable(record, nested, ["incompleteRequirements", "unfinishedRequirements", "unfinished_requirements", "incomplete"], "incomplete requirements"),
    ...unavailable(record, nested, ["decisions"], "decisions"),
    // Deliberately only record availability: transcript and prompt contents never enter the app model.
    ...unavailable(record, nested, ["transcript", "rawTranscript", "agentTranscript"], "agent conversation")
  ];
  return {
    checkpointId: identifier, timestamp: string(get("timestamp", "createdAt", "created_at")), goal: string(get("goal", "intent", "originalGoal")),
    completedRequirements: list(get("completedRequirements", "completed_requirements", "completed")),
    incompleteRequirements: list(get("incompleteRequirements", "unfinishedRequirements", "unfinished_requirements", "incomplete")),
    decisions: list(get("decisions")), assumptions: list(get("assumptions")), risks: list(get("risks")),
    filesChanged: list(get("filesChanged", "files_changed")), testsRun: list(get("testsRun", "tests_run")),
    testResults: list(get("testResults", "test_results")), agent: string(get("agent")),
    sessionSummary: string(get("sessionSummary", "summary", "session_summary")), sourceCommit: string(get("sourceCommit", "source_commit", "commit")), unavailableFields
  };
}

export function parseCheckpointList(value: unknown): Checkpoint[] {
  const records: unknown[] = Array.isArray(value) ? value : value && typeof value === "object" && Array.isArray((value as Record<string, unknown>).checkpoints) ? (value as Record<string, unknown>).checkpoints as unknown[] : [];
  return records.map(parseCheckpoint);
}
