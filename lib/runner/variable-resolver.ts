import "server-only";

import type {
  ScenarioJsonValue,
  ScenarioVariableCaptureMap,
} from "@/types/scenario";

const TEMPLATE_VARIABLE_REGEX = /\{\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}\}/g;

export class VariableResolutionError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export function collectReferencedVariables(input: string): string[] {
  const references = new Set<string>();

  for (const match of input.matchAll(TEMPLATE_VARIABLE_REGEX)) {
    if (match[1]) {
      references.add(match[1]);
    }
  }

  return Array.from(references);
}

export function resolveTemplateString(
  input: string,
  variables: Record<string, string>
): string {
  const missingVariables = new Set<string>();

  const output = input.replace(TEMPLATE_VARIABLE_REGEX, (_match, variableName) => {
    const value = variables[variableName as string];

    if (value === undefined) {
      missingVariables.add(variableName as string);
      return "";
    }

    return value;
  });

  if (missingVariables.size > 0) {
    throw new VariableResolutionError(
      `Missing runtime variables: ${Array.from(missingVariables).join(", ")}.`
    );
  }

  return output;
}

export function resolveJsonValue(
  input: ScenarioJsonValue,
  variables: Record<string, string>
): ScenarioJsonValue {
  if (typeof input === "string") {
    return resolveTemplateString(input, variables);
  }

  if (
    input === null ||
    typeof input === "boolean" ||
    typeof input === "number"
  ) {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map((entry) => resolveJsonValue(entry, variables));
  }

  const output: Record<string, ScenarioJsonValue> = {};

  for (const [key, value] of Object.entries(input)) {
    output[key] = resolveJsonValue(value, variables);
  }

  return output;
}

function parsePathSegments(path: string): Array<string | number> {
  const segments: Array<string | number> = [];
  const matcher = /([^.[\]]+)|\[(\d+)\]/g;

  for (const match of path.matchAll(matcher)) {
    if (match[1]) {
      segments.push(match[1]);
      continue;
    }

    if (match[2]) {
      segments.push(Number(match[2]));
    }
  }

  return segments;
}

function getValueAtPath(source: unknown, path: string): unknown {
  const segments = parsePathSegments(path);

  if (segments.length === 0) {
    return undefined;
  }

  let current: unknown = source;

  for (const segment of segments) {
    if (typeof segment === "number") {
      if (!Array.isArray(current) || segment >= current.length) {
        return undefined;
      }

      current = current[segment];
      continue;
    }

    if (typeof current !== "object" || current === null) {
      return undefined;
    }

    const record = current as Record<string, unknown>;
    current = record[segment];
  }

  return current;
}

function toVariableString(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (
    value === null ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  return JSON.stringify(value);
}

export function captureVariablesFromResponse(
  captureMap: ScenarioVariableCaptureMap,
  responseBody: unknown,
  existingVariables: Record<string, string>
): {
  nextVariables: Record<string, string>;
  capturedVariables: Record<string, string>;
} {
  const capturedVariables: Record<string, string> = {};

  for (const [variableName, path] of Object.entries(captureMap)) {
    const value = getValueAtPath(responseBody, path);

    if (value === undefined) {
      throw new VariableResolutionError(
        `Capture path ${path} for ${variableName} returned undefined.`
      );
    }

    capturedVariables[variableName] = toVariableString(value);
  }

  return {
    nextVariables: {
      ...existingVariables,
      ...capturedVariables,
    },
    capturedVariables,
  };
}
