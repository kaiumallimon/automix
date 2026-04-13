import type {
  Scenario,
  ScenarioHeaders,
  ScenarioHttpMethod,
  ScenarioInput,
  ScenarioJsonObject,
  ScenarioJsonValue,
  ScenarioPatchInput,
  ScenarioStep,
  ScenarioVariableCaptureMap,
} from "@/types/scenario";

const ALLOWED_METHODS: ReadonlySet<ScenarioHttpMethod> = new Set([
  "GET",
  "POST",
  "PATCH",
  "DELETE",
]);

const VARIABLE_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

export class ScenarioValidationError extends Error {
  constructor(message: string) {
    super(message);
  }
}

function readObject(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ScenarioValidationError(`${label} must be a JSON object.`);
  }

  return value as Record<string, unknown>;
}

function parseNonEmptyString(
  value: unknown,
  field: string,
  required: boolean,
  maxLength: number
): string | undefined {
  if (value === undefined && !required) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new ScenarioValidationError(`${field} must be a string.`);
  }

  const normalized = value.trim();

  if (!normalized) {
    throw new ScenarioValidationError(`${field} cannot be empty.`);
  }

  if (normalized.length > maxLength) {
    throw new ScenarioValidationError(
      `${field} cannot exceed ${maxLength} characters.`
    );
  }

  return normalized;
}

function parseDescription(
  value: unknown,
  required: boolean
): string | null | undefined {
  if (value === undefined && !required) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new ScenarioValidationError("description must be a string or null.");
  }

  const normalized = value.trim();
  return normalized.length === 0 ? null : normalized;
}

function parseHeaders(value: unknown): ScenarioHeaders {
  const headers = readObject(value, "headers");
  const parsedHeaders: ScenarioHeaders = {};

  for (const [headerName, headerValue] of Object.entries(headers)) {
    if (typeof headerValue !== "string") {
      throw new ScenarioValidationError(
        `Header value for ${headerName} must be a string.`
      );
    }

    parsedHeaders[headerName] = headerValue;
  }

  return parsedHeaders;
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

function parseExpectedResponse(value: unknown): ScenarioJsonObject {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ScenarioValidationError(
      "expectedResponse must be a JSON object."
    );
  }

  if (!isJsonValue(value)) {
    throw new ScenarioValidationError(
      "expectedResponse contains unsupported JSON value types."
    );
  }

  return value as ScenarioJsonObject;
}

function parseBody(value: unknown): ScenarioJsonValue {
  if (!isJsonValue(value)) {
    throw new ScenarioValidationError(
      "body contains unsupported JSON value types."
    );
  }

  return value;
}

function parseMethod(value: unknown): ScenarioHttpMethod {
  if (typeof value !== "string") {
    throw new ScenarioValidationError("method must be a string.");
  }

  if (!ALLOWED_METHODS.has(value as ScenarioHttpMethod)) {
    throw new ScenarioValidationError(
      "method must be one of GET, POST, PATCH, DELETE."
    );
  }

  return value as ScenarioHttpMethod;
}

function parseExpectedStatus(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new ScenarioValidationError("expectedStatus must be an integer.");
  }

  if (value < 100 || value > 599) {
    throw new ScenarioValidationError(
      "expectedStatus must be between 100 and 599."
    );
  }

  return value;
}

function parseCaptureMap(value: unknown): ScenarioVariableCaptureMap {
  const rawCapture = readObject(value, "capture");
  const capture: ScenarioVariableCaptureMap = {};

  for (const [variableName, path] of Object.entries(rawCapture)) {
    if (!VARIABLE_NAME_PATTERN.test(variableName)) {
      throw new ScenarioValidationError(
        `Capture variable name ${variableName} is invalid.`
      );
    }

    if (typeof path !== "string" || path.trim().length === 0) {
      throw new ScenarioValidationError(
        `Capture path for ${variableName} must be a non-empty string.`
      );
    }

    capture[variableName] = path.trim();
  }

  return capture;
}

function parseStep(rawStep: unknown, index: number): ScenarioStep {
  const step = readObject(rawStep, `steps[${index}]`);

  return {
    id:
      parseNonEmptyString(step.id, `steps[${index}].id`, true, 120) ??
      `step_${index + 1}`,
    name: parseNonEmptyString(step.name, `steps[${index}].name`, true, 120) as string,
    method: parseMethod(step.method),
    endpoint: parseNonEmptyString(
      step.endpoint,
      `steps[${index}].endpoint`,
      true,
      300
    ) as string,
    headers: parseHeaders(step.headers ?? {}),
    body: parseBody(step.body ?? null),
    expectedStatus: parseExpectedStatus(step.expectedStatus),
    expectedResponse: parseExpectedResponse(step.expectedResponse ?? {}),
    capture: parseCaptureMap(step.capture ?? {}),
  };
}

function parseSteps(value: unknown): ScenarioStep[] {
  if (!Array.isArray(value)) {
    throw new ScenarioValidationError("steps must be an array.");
  }

  if (value.length === 0) {
    throw new ScenarioValidationError("steps must contain at least one step.");
  }

  return value.map((step, index) => parseStep(step, index));
}

function parseApiConfigId(value: unknown, required: boolean): string | undefined {
  return parseNonEmptyString(value, "apiConfigId", required, 120);
}

export function parseScenarioInput(payload: unknown): ScenarioInput {
  const data = readObject(payload, "payload");

  return {
    apiConfigId: parseApiConfigId(data.apiConfigId, true) as string,
    name: parseNonEmptyString(data.name, "name", true, 120) as string,
    description: parseDescription(data.description ?? null, true) as string | null,
    steps: parseSteps(data.steps),
  };
}

export function parseScenarioPatchInput(payload: unknown): ScenarioPatchInput {
  const data = readObject(payload, "payload");

  const patch: ScenarioPatchInput = {
    apiConfigId: parseApiConfigId(data.apiConfigId, false),
    name: parseNonEmptyString(data.name, "name", false, 120),
    description: parseDescription(data.description, false),
    steps: data.steps === undefined ? undefined : parseSteps(data.steps),
  };

  const hasUpdates = Object.values(patch).some((value) => value !== undefined);
  if (!hasUpdates) {
    throw new ScenarioValidationError(
      "At least one updatable scenario field is required."
    );
  }

  return patch;
}

export function normalizeScenarioForStorage(
  scenario: ScenarioInput,
  userId: string,
  timestampIso: string,
  id: string
): Scenario {
  return {
    id,
    userId,
    createdAt: timestampIso,
    updatedAt: timestampIso,
    apiConfigId: scenario.apiConfigId,
    name: scenario.name,
    description: scenario.description,
    steps: scenario.steps,
  };
}
