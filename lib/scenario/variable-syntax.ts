import type { ScenarioStep } from "@/types/scenario";

const VARIABLE_TOKEN_REGEX = /\{\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}\}/g;

export function extractTemplateVariables(input: string): string[] {
  const variables = new Set<string>();

  for (const match of input.matchAll(VARIABLE_TOKEN_REGEX)) {
    const variableName = match[1];

    if (variableName) {
      variables.add(variableName);
    }
  }

  return Array.from(variables);
}

export function extractVariablesFromStepSource(
  endpoint: string,
  headersText: string,
  bodyText: string
): string[] {
  return Array.from(
    new Set([
      ...extractTemplateVariables(endpoint),
      ...extractTemplateVariables(headersText),
      ...extractTemplateVariables(bodyText),
    ])
  );
}

export function collectCapturedVariablesBeforeStep(
  steps: ScenarioStep[],
  index: number
): string[] {
  const variables = new Set<string>();

  for (const step of steps.slice(0, index)) {
    for (const variableName of Object.keys(step.capture)) {
      variables.add(variableName);
    }
  }

  return Array.from(variables);
}
