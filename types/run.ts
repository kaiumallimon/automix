export type RunOutcome = "passed" | "failed";

export interface ExecutedRequestSnapshot {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string | null;
}

export interface ExecutedResponseSnapshot {
  status: number;
  headers: Record<string, string>;
  body: unknown;
  rawBody: string;
}

export interface RunStepResult {
  stepId: string;
  stepName: string;
  outcome: RunOutcome;
  executionTimeMs: number;
  expectedStatus: number;
  actualStatus: number | null;
  referencedVariables: string[];
  capturedVariables: Record<string, string>;
  request: ExecutedRequestSnapshot;
  response: ExecutedResponseSnapshot | null;
  errorMessage: string | null;
}

export interface ScenarioRunResult {
  scenarioId: string;
  scenarioName: string;
  startedAt: string;
  finishedAt: string;
  totalExecutionTimeMs: number;
  outcome: RunOutcome;
  finalVariables: Record<string, string>;
  steps: RunStepResult[];
}
