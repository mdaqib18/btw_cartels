import type { Checkpoint, ContextStatus, SanitizedCheckpoint } from "@/lib/types";

const secretPattern = /\b(?:api[_ -]?key|token|password|secret|authorization)\b|\b(?:sk|pk|AKIA)[-_a-zA-Z0-9]{8,}\b/i;
const redactedPattern = /\[\s*redacted\s*\]/i;
const sensitiveFields = new Set(["transcript", "prompt", "rawPrompt", "rawTranscript", "messages"]);

/**
 * Local privacy boundary. This is the only accepted input shape for Databricks.
 * It drops raw conversation fields and suppresses redacted or secret-like values.
 */
function safeText(value: string | null): string | null { return !value || secretPattern.test(value) || redactedPattern.test(value) ? null : value; }
function safeList(values: string[] | null): string[] | null {
  if (values === null) return null;
  const filtered = values.filter((value) => safeText(value) !== null);
  return filtered.length === values.length ? values : filtered;
}

export function getContextStatus(checkpoint: Pick<Checkpoint, "goal" | "completedRequirements" | "incompleteRequirements" | "decisions" | "unavailableFields">): ContextStatus {
  if (!checkpoint.goal || (checkpoint.completedRequirements === null && checkpoint.incompleteRequirements === null)) return "INSUFFICIENT";
  return checkpoint.unavailableFields.length || checkpoint.decisions === null ? "PARTIAL" : "COMPLETE";
}

export function sanitizeCheckpointForExternal(checkpoint: Checkpoint): SanitizedCheckpoint {
  const redactedFields: string[] = [];
  const protect = <K extends keyof Checkpoint>(key: K, value: Checkpoint[K]) => {
    const sanitized = Array.isArray(value) ? safeList(value) : typeof value === "string" || value === null ? safeText(value) : value;
    if (value !== sanitized) redactedFields.push(String(key));
    return sanitized;
  };
  const safe = {
    checkpointId: checkpoint.checkpointId, timestamp: checkpoint.timestamp, goal: protect("goal", checkpoint.goal) as string | null,
    completedRequirements: protect("completedRequirements", checkpoint.completedRequirements) as string[] | null,
    incompleteRequirements: protect("incompleteRequirements", checkpoint.incompleteRequirements) as string[] | null,
    decisions: protect("decisions", checkpoint.decisions) as string[] | null, assumptions: protect("assumptions", checkpoint.assumptions) as string[] | null,
    risks: protect("risks", checkpoint.risks) as string[] | null, filesChanged: protect("filesChanged", checkpoint.filesChanged) as string[] | null,
    testsRun: protect("testsRun", checkpoint.testsRun) as string[] | null, testResults: protect("testResults", checkpoint.testResults) as string[] | null,
    agent: protect("agent", checkpoint.agent) as string | null,
    // Free-form summaries can include prompt/transcript fragments; preserve only locally.
    sessionSummary: null,
    sourceCommit: checkpoint.sourceCommit, unavailableFields: [...new Set([...checkpoint.unavailableFields, ...(checkpoint.sessionSummary ? ["session summary"] : []), ...redactedFields])]
  };
  return { ...safe, contextStatus: getContextStatus(safe), redactedFields };
}

/** Raw user prompts never leave the process. Sensitive queries are blocked, not rewritten. */
export function sanitizeExternalQuery(query: string): { value?: string; status?: string } {
  if (!query.trim()) return { status: "A search query is required." };
  if (secretPattern.test(query) || redactedPattern.test(query)) return { status: "Privacy boundary blocked a sensitive or redacted query from leaving the local environment." };
  return { value: query.trim() };
}

export const privacyContract = { excludedFields: [...sensitiveFields], excludedContent: ["raw prompts", "transcripts", "secrets", "tokens", "passwords", "API keys"] };
