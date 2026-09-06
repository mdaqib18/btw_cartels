export type EvidenceSource = "entire-checkpoint" | "entire-graph" | "databricks-memory" | "test" | "model-inference";
export type Evidence = { source: EvidenceSource; checkpointId?: string | null; file?: string | null; line?: number | null; relationship?: string | null; relatedFile?: string | null; claim: string };
export type Checkpoint = {
  checkpointId: string; timestamp: string | null; goal: string | null; completedRequirements: string[] | null;
  incompleteRequirements: string[] | null; decisions: string[] | null; assumptions: string[] | null; risks: string[] | null;
  filesChanged: string[] | null; testsRun: string[] | null; testResults: string[] | null; agent: string | null;
  sessionSummary: string | null; sourceCommit: string | null;
};
export type GraphEvidence = Evidence & { source: "entire-graph"; file: string | null; relationship: string | null; relatedFile: string | null };
export type IntentReport = { intentCoverage: number | null; originalGoal: string | null; completed: string[]; unfinished: string[]; decisions: string[]; risks: string[]; confidence: number; evidence: Evidence[]; status?: string };
export type ImpactReport = { risk: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN"; affectedFiles: string[]; relationships: GraphEvidence[]; recommendedTests: string[]; reason: string; evidence: Evidence[]; status?: string };
