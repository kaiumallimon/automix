import "server-only";

import type { DocumentData } from "firebase-admin/firestore";

import { getFirebaseServerFirestore } from "@/lib/firebase/firestore-server";
import type {
  Scenario,
  ScenarioHttpMethod,
  ScenarioInput,
  ScenarioJsonObject,
  ScenarioJsonValue,
  ScenarioPatchInput,
  ScenarioStep,
  ScenarioVariableCaptureMap,
} from "@/types/scenario";

import { parseScenarioInput, parseScenarioPatchInput } from "./schema";

const SCENARIO_COLLECTION = "scenarios";

export class ScenarioNotFoundError extends Error {
  constructor(scenarioId: string) {
    super(`Scenario ${scenarioId} was not found.`);
  }
}

function getCollectionRef() {
  return getFirebaseServerFirestore().collection(SCENARIO_COLLECTION);
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
    throw new Error(`Invalid scenario field ${key}.`);
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
    throw new Error(`Invalid scenario field ${key}.`);
  }

  return value;
}

function isJsonValue(value: unknown): value is ScenarioJsonValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every((entry) => isJsonValue(entry));
  }

  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).every((entry) =>
      isJsonValue(entry)
    );
  }

  return false;
}

function readCaptureMap(value: unknown): ScenarioVariableCaptureMap {
  const captureObject = asObject(value, "scenario capture");
  const capture: ScenarioVariableCaptureMap = {};

  for (const [key, mapValue] of Object.entries(captureObject)) {
    if (typeof mapValue !== "string") {
      throw new Error(`Invalid capture mapping for ${key}.`);
    }

    capture[key] = mapValue;
  }

  return capture;
}

function readHeaders(value: unknown): Record<string, string> {
  const headerObject = asObject(value, "scenario headers");
  const headers: Record<string, string> = {};

  for (const [key, headerValue] of Object.entries(headerObject)) {
    if (typeof headerValue !== "string") {
      throw new Error(`Invalid header value for ${key}.`);
    }

    headers[key] = headerValue;
  }

  return headers;
}

function readMethod(value: unknown): ScenarioHttpMethod {
  if (value !== "GET" && value !== "POST" && value !== "PATCH" && value !== "DELETE") {
    throw new Error("Invalid scenario method.");
  }

  return value;
}

function readStep(value: unknown): ScenarioStep {
  const step = asObject(value, "scenario step");

  const body = step.body;
  if (!isJsonValue(body)) {
    throw new Error("Scenario step body contains unsupported JSON value.");
  }

  const expectedResponse = step.expectedResponse;
  if (
    typeof expectedResponse !== "object" ||
    expectedResponse === null ||
    Array.isArray(expectedResponse) ||
    !isJsonValue(expectedResponse)
  ) {
    throw new Error("Scenario expectedResponse must be a JSON object.");
  }

  const expectedStatus = step.expectedStatus;
  if (typeof expectedStatus !== "number" || !Number.isInteger(expectedStatus)) {
    throw new Error("Scenario expectedStatus must be an integer.");
  }

  return {
    id: readString(step, "id"),
    name: readString(step, "name"),
    method: readMethod(step.method),
    endpoint: readString(step, "endpoint"),
    headers: readHeaders(step.headers),
    body,
    expectedStatus,
    expectedResponse: expectedResponse as ScenarioJsonObject,
    capture: readCaptureMap(step.capture),
  };
}

function mapScenario(id: string, payload: DocumentData): Scenario {
  const data = asObject(payload, "scenario document");

  const rawSteps = data.steps;
  if (!Array.isArray(rawSteps)) {
    throw new Error("Invalid scenario steps payload.");
  }

  return {
    id,
    userId: readString(data, "userId"),
    createdAt: readString(data, "createdAt"),
    updatedAt: readString(data, "updatedAt"),
    apiConfigId: readString(data, "apiConfigId"),
    name: readString(data, "name"),
    description: readNullableString(data, "description"),
    steps: rawSteps.map((step) => readStep(step)),
  };
}

async function getOwnedScenarioOrThrow(
  userId: string,
  scenarioId: string
): Promise<Scenario> {
  const snapshot = await getCollectionRef().doc(scenarioId).get();

  if (!snapshot.exists) {
    throw new ScenarioNotFoundError(scenarioId);
  }

  const data = snapshot.data();

  if (!data) {
    throw new ScenarioNotFoundError(scenarioId);
  }

  const scenario = mapScenario(snapshot.id, data);

  if (scenario.userId !== userId) {
    throw new ScenarioNotFoundError(scenarioId);
  }

  return scenario;
}

export async function listScenarios(userId: string): Promise<Scenario[]> {
  const snapshot = await getCollectionRef().where("userId", "==", userId).get();

  const scenarios = snapshot.docs.map((docSnapshot) =>
    mapScenario(docSnapshot.id, docSnapshot.data())
  );

  return scenarios.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function createScenario(
  userId: string,
  rawInput: unknown
): Promise<Scenario> {
  const input = parseScenarioInput(rawInput);
  const now = new Date().toISOString();

  const docRef = await getCollectionRef().add({
    userId,
    apiConfigId: input.apiConfigId,
    name: input.name,
    description: input.description,
    steps: input.steps,
    createdAt: now,
    updatedAt: now,
  });

  return {
    id: docRef.id,
    userId,
    createdAt: now,
    updatedAt: now,
    apiConfigId: input.apiConfigId,
    name: input.name,
    description: input.description,
    steps: input.steps,
  };
}

export async function getScenarioById(
  userId: string,
  scenarioId: string
): Promise<Scenario> {
  return getOwnedScenarioOrThrow(userId, scenarioId);
}

export async function updateScenario(
  userId: string,
  scenarioId: string,
  rawPatch: unknown
): Promise<Scenario> {
  const patch = parseScenarioPatchInput(rawPatch);
  const existing = await getOwnedScenarioOrThrow(userId, scenarioId);

  const updated: Scenario = {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  await getCollectionRef().doc(scenarioId).update({
    apiConfigId: updated.apiConfigId,
    name: updated.name,
    description: updated.description,
    steps: updated.steps,
    updatedAt: updated.updatedAt,
  });

  return updated;
}

export async function deleteScenario(
  userId: string,
  scenarioId: string
): Promise<void> {
  await getOwnedScenarioOrThrow(userId, scenarioId);
  await getCollectionRef().doc(scenarioId).delete();
}

export function parseScenarioForCreate(rawInput: unknown): ScenarioInput {
  return parseScenarioInput(rawInput);
}

export function parseScenarioForPatch(rawInput: unknown): ScenarioPatchInput {
  return parseScenarioPatchInput(rawInput);
}
