import type { BaseEntity } from "./index";
import type {
  ExecutedRequestSnapshot,
  ExecutedResponseSnapshot,
  RunOutcome,
} from "./run";

export interface RunRecord extends BaseEntity {
  scenarioId: string;
  scenarioName: string;
  apiConfigId: string;
  startedAt: string;
  finishedAt: string;
  totalExecutionTimeMs: number;
  outcome: RunOutcome;
  finalVariables: Record<string, string>;
}

export interface RunStepRecord extends BaseEntity {
  runId: string;
  scenarioId: string;
  stepIndex: number;
  stepId: string;
  stepName: string;
  outcome: RunOutcome;
  expectedStatus: number;
  actualStatus: number | null;
  executionTimeMs: number;
  referencedVariables: string[];
  capturedVariables: Record<string, string>;
  request: ExecutedRequestSnapshot;
  response: ExecutedResponseSnapshot | null;
  errorMessage: string | null;
}

export interface RunWithSteps {
  run: RunRecord;
  steps: RunStepRecord[];
}
