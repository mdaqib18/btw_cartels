import type { Checkpoint, Evidence, GraphEvidence, ImpactReport, IntentReport } from "./types";

const checkpointEvidence = (checkpoint: Checkpoint, claim: string): Evidence => ({ source: "entire-checkpoint", checkpointId: checkpoint.checkpointId, claim });
export function analyzeIntent(checkpoint: Checkpoint | undefined): IntentReport {
  if (!checkpoint) return { intentCoverage: null, originalGoal: null, completed: [], unfinished: [], decisions: [], risks: [], confidence: 0, evidence: [], status: "Insufficient evidence: no Entire checkpoint has been imported." };
  const completed = checkpoint.completedRequirements || []; const unfinished = checkpoint.incompleteRequirements || [];
  const denominator = completed.length + unfinished.length;
  const evidence = [checkpoint.goal && checkpointEvidence(checkpoint, `Goal recorded in checkpoint: ${checkpoint.goal}`), ...completed.map((item) => checkpointEvidence(checkpoint, `Completed: ${item}`)), ...unfinished.map((item) => checkpointEvidence(checkpoint, `Unfinished: ${item}`))].filter(Boolean) as Evidence[];
  return { intentCoverage: denominator ? Math.round((completed.length / denominator) * 100) : null, originalGoal: checkpoint.goal, completed, unfinished, decisions: checkpoint.decisions || [], risks: checkpoint.risks || [], confidence: evidence.length ? 0.9 : 0.2, evidence, status: denominator ? undefined : "Insufficient evidence: checkpoint does not enumerate requirements." };
}
export function analyzeImpact(target: string, relationships: GraphEvidence[], checkpoint?: Checkpoint): ImpactReport {
  if (!relationships.length) return { risk: "UNKNOWN", affectedFiles: [], relationships, recommendedTests: checkpoint?.testsRun || [], reason: "Insufficient evidence: Entire Graph returned no relationships.", evidence: [], status: "Insufficient evidence" };
  const joined = relationships.map((item) => `${item.relationship} ${item.claim}`).join(" ").toLowerCase();
  const risk = /(payment|auth|webhook|delete|write|critical)/.test(joined) ? "HIGH" : relationships.length > 3 ? "MEDIUM" : "LOW";
  const tests = (checkpoint?.testsRun || []).filter((test) => relationships.some((edge) => edge.relatedFile?.toLowerCase().includes(test.split("/").pop()?.replace(/\.test\..*/, "") || "__none__")));
  return { risk, affectedFiles: [...new Set(relationships.map((item) => item.relatedFile).filter((item): item is string => !!item))], relationships, recommendedTests: tests.length ? tests : checkpoint?.testsRun || [], reason: `Risk is ${risk} from ${relationships.length} Entire Graph relationship(s) connected to ${target}.`, evidence: relationships };
}
export function buildResumePrompt(intent: IntentReport, impact?: ImpactReport, checkpoint?: Checkpoint): string {
  return ["Continue this implementation using only the verified evidence below.", `Original goal: ${intent.originalGoal || "Unknown"}`, `Completed: ${intent.completed.join("; ") || "Unknown"}`, `Unfinished: ${intent.unfinished.join("; ") || "Unknown"}`, `Important decisions: ${intent.decisions.join("; ") || "Unknown"}`, `Known risks: ${intent.risks.join("; ") || "Unknown"}`, `Checkpoint: ${checkpoint?.checkpointId || "Unknown"}`, `Graph impact: ${impact?.affectedFiles.join("; ") || "Unknown"}`, `Recommended next action: ${intent.unfinished[0] ? `Implement ${intent.unfinished[0]} and preserve existing decisions.` : "Inspect the latest checkpoint and clarify missing work."}`, `Recommended tests: ${impact?.recommendedTests.join("; ") || checkpoint?.testsRun?.join("; ") || "Unknown"}`].join("\n\n");
}
