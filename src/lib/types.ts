export type EvidenceSource = "entire-checkpoint" | "entire-graph" | "databricks-memory" | "test" | "model-inference";
export type ContextStatus = "COMPLETE" | "PARTIAL" | "INSUFFICIENT";
export type Evidence = { source: EvidenceSource; checkpointId?: string | null; file?: string | null; line?: number | null; relationship?: string | null; relatedFile?: string | null; claim: string };
export type Checkpoint = {
  checkpointId: string; timestamp: string | null; goal: string | null; completedRequirements: string[] | null;
  incompleteRequirements: string[] | null; decisions: string[] | null; assumptions: string[] | null; risks: string[] | null;
  filesChanged: string[] | null; testsRun: string[] | null; testResults: string[] | null; agent: string | null;
  sessionSummary: string | null; sourceCommit: string | null;
  /** Local-only metadata; raw transcript/prompt content is never normalized or persisted. */
  unavailableFields: string[];
};
export type SanitizedCheckpoint = Pick<Checkpoint, "checkpointId" | "timestamp" | "goal" | "completedRequirements" | "incompleteRequirements" | "decisions" | "assumptions" | "risks" | "filesChanged" | "testsRun" | "testResults" | "agent" | "sessionSummary" | "sourceCommit" | "unavailableFields"> & { contextStatus: ContextStatus; redactedFields: string[] };
export type GraphEvidence = Evidence & { source: "entire-graph"; file: string | null; relationship: string | null; relatedFile: string | null };
export type IntentReport = { intentCoverage: number | null; originalGoal: string | null; completed: string[]; unfinished: string[]; decisions: string[]; risks: string[]; confidence: number; evidence: Evidence[]; contextStatus: ContextStatus; unavailableFields: string[]; status?: string };
export type ImpactReport = { risk: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN"; affectedFiles: string[]; relationships: GraphEvidence[]; recommendedTests: string[]; reason: string; evidence: Evidence[]; status?: string };
