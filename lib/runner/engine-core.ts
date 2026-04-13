import "server-only";

import type { ApiConfig } from "@/types/api-config";
import type { Scenario, ScenarioJsonValue, ScenarioStep } from "@/types/scenario";
import type {
  RunOutcome,
  RunStepResult,
  ScenarioRunResult,
} from "@/types/run";

import { executeHttpRequest } from "./request-handler";
import {
  captureVariablesFromResponse,
  collectReferencedVariables,
  resolveJsonValue,
  resolveTemplateString,
} from "./variable-resolver";

interface RunnerCoreInput {
  scenario: Scenario;
  apiConfig: ApiConfig;
}

function nowEpochMs(): number {
  return Date.now();
}

function parseUrl(baseUrl: string, endpoint: string): string {
  try {
    return new URL(endpoint, baseUrl).toString();
  } catch {
    throw new Error(`Invalid endpoint URL: ${endpoint}`);
  }
}

function mergeHeaders(
  defaultHeaders: Record<string, string>,
  stepHeaders: Record<string, string>
): Record<string, string> {
  return {
    ...defaultHeaders,
    ...stepHeaders,
  };
}

function resolveHeaders(
  headers: Record<string, string>,
  variables: Record<string, string>
): Record<string, string> {
  const resolved: Record<string, string> = {};

  for (const [key, value] of Object.entries(headers)) {
    resolved[key] = resolveTemplateString(value, variables);
  }

  return resolved;
}

function shouldSendBody(method: string): boolean {
  return method !== "GET" && method !== "DELETE";
}

function toRequestBody(body: ScenarioJsonValue, method: string): string | null {
  if (!shouldSendBody(method)) {
    return null;
  }

  return JSON.stringify(body);
}

function matchesExpectedResponse(actual: unknown, expected: unknown): boolean {
  if (
    expected === null ||
    typeof expected === "string" ||
    typeof expected === "number" ||
    typeof expected === "boolean"
  ) {
    return actual === expected;
  }

  if (Array.isArray(expected)) {
    if (!Array.isArray(actual) || actual.length < expected.length) {
      return false;
    }

    return expected.every((expectedItem, index) =>
      matchesExpectedResponse(actual[index], expectedItem)
    );
  }

  if (typeof expected === "object") {
    if (typeof actual !== "object" || actual === null || Array.isArray(actual)) {
      return false;
    }

    return Object.entries(expected as Record<string, unknown>).every(
      ([key, expectedValue]) =>
        matchesExpectedResponse(
          (actual as Record<string, unknown>)[key],
          expectedValue
        )
    );
  }

  return false;
}

function makeRunStepResult(input: {
  step: ScenarioStep;
  outcome: RunOutcome;
  executionTimeMs: number;
  expectedStatus: number;
  actualStatus: number | null;
  referencedVariables: string[];
  capturedVariables: Record<string, string>;
  request: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body: string | null;
  };
  response: {
    status: number;
    headers: Record<string, string>;
    body: unknown;
    rawBody: string;
  } | null;
  errorMessage: string | null;
}): RunStepResult {
  return {
    stepId: input.step.id,
    stepName: input.step.name,
    outcome: input.outcome,
    executionTimeMs: input.executionTimeMs,
    expectedStatus: input.expectedStatus,
    actualStatus: input.actualStatus,
    referencedVariables: input.referencedVariables,
    capturedVariables: input.capturedVariables,
    request: input.request,
    response: input.response,
    errorMessage: input.errorMessage,
  };
}

export async function runScenarioCore(
  input: RunnerCoreInput
): Promise<ScenarioRunResult> {
  const startedEpoch = nowEpochMs();
  const startedAt = new Date(startedEpoch).toISOString();

  const stepResults: RunStepResult[] = [];
  let runOutcome: RunOutcome = "passed";
  let runtimeVariables: Record<string, string> = {};

  for (const step of input.scenario.steps) {
    const stepStart = nowEpochMs();

    const referencedVariables = collectReferencedVariables(
      `${step.endpoint}\n${JSON.stringify(step.headers)}\n${JSON.stringify(step.body)}`
    );

    try {
      const resolvedEndpoint = resolveTemplateString(step.endpoint, runtimeVariables);
      const requestUrl = parseUrl(input.apiConfig.baseUrl, resolvedEndpoint);

      const requestHeaders = resolveHeaders(
        mergeHeaders(input.apiConfig.defaultHeaders, step.headers),
        runtimeVariables
      );

      const resolvedBody = resolveJsonValue(step.body, runtimeVariables);
      const requestBody = toRequestBody(resolvedBody, step.method);

      const response = await executeHttpRequest({
        method: step.method,
        url: requestUrl,
        headers: requestHeaders,
        body: requestBody,
      });

      const statusMatches = response.status === step.expectedStatus;
      const responseMatches = matchesExpectedResponse(
        response.body,
        step.expectedResponse
      );
      const outcome: RunOutcome =
        statusMatches && responseMatches ? "passed" : "failed";

      const captureResult = captureVariablesFromResponse(
        step.capture,
        response.body,
        runtimeVariables
      );
      runtimeVariables = captureResult.nextVariables;

      if (outcome === "failed") {
        runOutcome = "failed";
      }

      stepResults.push(
        makeRunStepResult({
          step,
          outcome,
          executionTimeMs: nowEpochMs() - stepStart,
          expectedStatus: step.expectedStatus,
          actualStatus: response.status,
          referencedVariables,
          capturedVariables: captureResult.capturedVariables,
          request: {
            method: step.method,
            url: requestUrl,
            headers: requestHeaders,
            body: requestBody,
          },
          response,
          errorMessage: null,
        })
      );
    } catch (error) {
      runOutcome = "failed";

      const message =
        error instanceof Error ? error.message : "Step execution failed.";

      stepResults.push(
        makeRunStepResult({
          step,
          outcome: "failed",
          executionTimeMs: nowEpochMs() - stepStart,
          expectedStatus: step.expectedStatus,
          actualStatus: null,
          referencedVariables,
          capturedVariables: {},
          request: {
            method: step.method,
            url: parseUrl(input.apiConfig.baseUrl, step.endpoint),
            headers: mergeHeaders(input.apiConfig.defaultHeaders, step.headers),
            body: toRequestBody(step.body, step.method),
          },
          response: null,
          errorMessage: message,
        })
      );
    }
  }

  const finishedEpoch = nowEpochMs();

  return {
    scenarioId: input.scenario.id,
    scenarioName: input.scenario.name,
    startedAt,
    finishedAt: new Date(finishedEpoch).toISOString(),
    totalExecutionTimeMs: finishedEpoch - startedEpoch,
    outcome: runOutcome,
    finalVariables: runtimeVariables,
    steps: stepResults,
  };
}
