import "server-only";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  type DocumentData,
} from "firebase/firestore";

import { getFirebaseServerFirestore } from "@/lib/firebase/firestore-server";
import type { ScenarioRunResult } from "@/types/run";
import type { RunRecord, RunStepRecord, RunWithSteps } from "@/types/run-log";

const RUN_COLLECTION = "runs";
const RUN_STEP_COLLECTION = "runSteps";

export class RunNotFoundError extends Error {
  constructor(runId: string) {
    super(`Run ${runId} was not found.`);
  }
}

function getRunCollectionRef() {
  return collection(getFirebaseServerFirestore(), RUN_COLLECTION);
}

function getRunStepCollectionRef() {
  return collection(getFirebaseServerFirestore(), RUN_STEP_COLLECTION);
}

function sanitizeForFirestore(value: unknown): unknown {
  if (value === undefined) {
    return null;
  }

  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeForFirestore(entry));
  }

  if (typeof value === "object") {
    const output: Record<string, unknown> = {};

    for (const [key, entryValue] of Object.entries(value as Record<string, unknown>)) {
      output[key] = sanitizeForFirestore(entryValue);
    }

    return output;
  }

  return String(value);
}

function asObject(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`Invalid ${label}.`);
  }

  return value as Record<string, unknown>;
}

function readString(source: Record<string, unknown>, key: string): string {
  const value = source[key];

  if (typeof value !== "string") {
    throw new Error(`Invalid run field ${key}.`);
  }

  return value;
}

function readNullableString(
  source: Record<string, unknown>,
  key: string
): string | null {
  const value = source[key];

  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error(`Invalid run field ${key}.`);
  }

  return value;
}

function readNumber(source: Record<string, unknown>, key: string): number {
  const value = source[key];

  if (typeof value !== "number") {
    throw new Error(`Invalid run field ${key}.`);
  }

  return value;
}

function readStringArray(source: Record<string, unknown>, key: string): string[] {
  const value = source[key];

  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`Invalid run field ${key}.`);
  }

  return value;
}

function readStringRecord(value: unknown, label: string): Record<string, string> {
  const record = asObject(value, label);
  const output: Record<string, string> = {};

  for (const [key, entryValue] of Object.entries(record)) {
    if (typeof entryValue !== "string") {
      throw new Error(`Invalid ${label} value for ${key}.`);
    }

    output[key] = entryValue;
  }

  return output;
}

function mapRequestSnapshot(value: unknown): RunStepRecord["request"] {
  const request = asObject(value, "request");
  const body = request.body;

  if (body !== null && typeof body !== "string") {
    throw new Error("Invalid request body payload.");
  }

  return {
    method: readString(request, "method"),
    url: readString(request, "url"),
    headers: readStringRecord(request.headers, "request headers"),
    body,
  };
}

function mapResponseSnapshot(value: unknown): RunStepRecord["response"] {
  if (value === null) {
    return null;
  }

  const response = asObject(value, "response");

  return {
    status: readNumber(response, "status"),
    headers: readStringRecord(response.headers, "response headers"),
    body: response.body,
    rawBody: readString(response, "rawBody"),
  };
}

function mapRunRecord(id: string, payload: DocumentData): RunRecord {
  const data = asObject(payload, "run record");
  const outcome = readString(data, "outcome");

  if (outcome !== "passed" && outcome !== "failed") {
    throw new Error("Invalid run outcome.");
  }

  return {
    id,
    userId: readString(data, "userId"),
    createdAt: readString(data, "createdAt"),
    updatedAt: readString(data, "updatedAt"),
    scenarioId: readString(data, "scenarioId"),
    scenarioName: readString(data, "scenarioName"),
    apiConfigId: readString(data, "apiConfigId"),
    startedAt: readString(data, "startedAt"),
    finishedAt: readString(data, "finishedAt"),
    totalExecutionTimeMs: readNumber(data, "totalExecutionTimeMs"),
    outcome,
    finalVariables: asObject(data.finalVariables, "finalVariables") as Record<
      string,
      string
    >,
  };
}

function mapRunStepRecord(id: string, payload: DocumentData): RunStepRecord {
  const data = asObject(payload, "run step record");
  const outcome = readString(data, "outcome");

  if (outcome !== "passed" && outcome !== "failed") {
    throw new Error("Invalid run step outcome.");
  }

  return {
    id,
    userId: readString(data, "userId"),
    createdAt: readString(data, "createdAt"),
    updatedAt: readString(data, "updatedAt"),
    runId: readString(data, "runId"),
    scenarioId: readString(data, "scenarioId"),
    stepIndex: readNumber(data, "stepIndex"),
    stepId: readString(data, "stepId"),
    stepName: readString(data, "stepName"),
    outcome,
    expectedStatus: readNumber(data, "expectedStatus"),
    expectedResponse: data.expectedResponse,
    actualStatus: data.actualStatus === null ? null : readNumber(data, "actualStatus"),
    executionTimeMs: readNumber(data, "executionTimeMs"),
    referencedVariables: readStringArray(data, "referencedVariables"),
    capturedVariables: asObject(data.capturedVariables, "capturedVariables") as Record<
      string,
      string
    >,
    request: mapRequestSnapshot(data.request),
    response: mapResponseSnapshot(data.response),
    errorMessage: readNullableString(data, "errorMessage"),
  };
}

export async function logScenarioRun(
  userId: string,
  apiConfigId: string,
  runResult: ScenarioRunResult
): Promise<RunRecord> {
  const now = new Date().toISOString();

  const runDocRef = await addDoc(getRunCollectionRef(), {
    userId,
    scenarioId: runResult.scenarioId,
    scenarioName: runResult.scenarioName,
    apiConfigId,
    startedAt: runResult.startedAt,
    finishedAt: runResult.finishedAt,
    totalExecutionTimeMs: runResult.totalExecutionTimeMs,
    outcome: runResult.outcome,
    finalVariables: sanitizeForFirestore(runResult.finalVariables),
    createdAt: now,
    updatedAt: now,
  });

  for (const [stepIndex, step] of runResult.steps.entries()) {
    await addDoc(getRunStepCollectionRef(), {
      userId,
      runId: runDocRef.id,
      scenarioId: runResult.scenarioId,
      stepIndex,
      stepId: step.stepId,
      stepName: step.stepName,
      outcome: step.outcome,
      expectedStatus: step.expectedStatus,
      expectedResponse: sanitizeForFirestore(step.expectedResponse),
      actualStatus: step.actualStatus,
      executionTimeMs: step.executionTimeMs,
      referencedVariables: sanitizeForFirestore(step.referencedVariables),
      capturedVariables: sanitizeForFirestore(step.capturedVariables),
      request: sanitizeForFirestore(step.request),
      response: sanitizeForFirestore(step.response),
      errorMessage: step.errorMessage,
      createdAt: now,
      updatedAt: now,
    });
  }

  return {
    id: runDocRef.id,
    userId,
    createdAt: now,
    updatedAt: now,
    scenarioId: runResult.scenarioId,
    scenarioName: runResult.scenarioName,
    apiConfigId,
    startedAt: runResult.startedAt,
    finishedAt: runResult.finishedAt,
    totalExecutionTimeMs: runResult.totalExecutionTimeMs,
    outcome: runResult.outcome,
    finalVariables: runResult.finalVariables,
  };
}

async function getOwnedRunOrThrow(userId: string, runId: string): Promise<RunRecord> {
  const snapshot = await getDoc(doc(getRunCollectionRef(), runId));

  if (!snapshot.exists()) {
    throw new RunNotFoundError(runId);
  }

  const run = mapRunRecord(snapshot.id, snapshot.data());

  if (run.userId !== userId) {
    throw new RunNotFoundError(runId);
  }

  return run;
}

export async function listRuns(
  userId: string,
  scenarioId?: string
): Promise<RunRecord[]> {
  const conditions = [where("userId", "==", userId)];

  if (scenarioId) {
    conditions.push(where("scenarioId", "==", scenarioId));
  }

  const snapshot = await getDocs(query(getRunCollectionRef(), ...conditions));

  const runs = snapshot.docs.map((docSnapshot) =>
    mapRunRecord(docSnapshot.id, docSnapshot.data())
  );

  return runs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getRunWithSteps(
  userId: string,
  runId: string
): Promise<RunWithSteps> {
  const run = await getOwnedRunOrThrow(userId, runId);

  const snapshot = await getDocs(
    query(
      getRunStepCollectionRef(),
      where("userId", "==", userId),
      where("runId", "==", runId)
    )
  );

  const steps = snapshot.docs
    .map((docSnapshot) => mapRunStepRecord(docSnapshot.id, docSnapshot.data()))
    .sort((a, b) => a.stepIndex - b.stepIndex);

  return {
    run,
    steps,
  };
}
