import "server-only";

import type { ApiConfig } from "@/types/api-config";
import type {
  Scenario,
  ScenarioJsonObject,
  ScenarioJsonValue,
  ScenarioStep,
} from "@/types/scenario";
import type { ScenarioRunResult } from "@/types/run";

import { runScenarioCore } from "./engine-core";

interface StepMutation {
  label: string;
  step: ScenarioStep;
}

export interface FuzzRunResult {
  label: string;
  result: ScenarioRunResult;
}

function cloneStep(step: ScenarioStep): ScenarioStep {
  return {
    ...step,
    headers: { ...step.headers },
    body: step.body,
    expectedResponse: { ...step.expectedResponse },
    capture: { ...step.capture },
  };
}

function mutatePrimitiveType(value: ScenarioJsonValue): ScenarioJsonValue {
  if (typeof value === "string") {
    return 9999;
  }

  if (typeof value === "number") {
    return "invalid-number";
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (value === null) {
    return { invalid: true } as ScenarioJsonObject;
  }

  if (Array.isArray(value)) {
    return ["invalid-array-item"];
  }

  return null;
}

function mutateObjectMissingField(step: ScenarioStep): StepMutation | null {
  if (typeof step.body !== "object" || step.body === null || Array.isArray(step.body)) {
    return null;
  }

  const keys = Object.keys(step.body);
  if (keys.length === 0) {
    return null;
  }

  const [removedKey, ...rest] = keys;
  const mutatedBody: ScenarioJsonObject = {};

  for (const key of rest) {
    mutatedBody[key] = step.body[key];
  }

  return {
    label: `${step.name}: missing field ${removedKey}`,
    step: {
      ...step,
      body: mutatedBody,
    },
  };
}

function mutateToNull(step: ScenarioStep): StepMutation {
  return {
    label: `${step.name}: null body`,
    step: {
      ...step,
      body: null,
    },
  };
}

function mutateLongString(step: ScenarioStep): StepMutation | null {
  const longString = "X".repeat(2048);

  if (typeof step.body === "string") {
    return {
      label: `${step.name}: long string body`,
      step: {
        ...step,
        body: longString,
      },
    };
  }

  if (typeof step.body !== "object" || step.body === null || Array.isArray(step.body)) {
    return null;
  }

  const keys = Object.keys(step.body);

  for (const key of keys) {
    if (typeof step.body[key] === "string") {
      return {
        label: `${step.name}: long string field ${key}`,
        step: {
          ...step,
          body: {
            ...step.body,
            [key]: longString,
          },
        },
      };
    }
  }

  return null;
}

function mutateWrongType(step: ScenarioStep): StepMutation | null {
  if (
    step.body === null ||
    typeof step.body === "string" ||
    typeof step.body === "number" ||
    typeof step.body === "boolean" ||
    Array.isArray(step.body)
  ) {
    return {
      label: `${step.name}: wrong body type`,
      step: {
        ...step,
        body: mutatePrimitiveType(step.body),
      },
    };
  }

  const keys = Object.keys(step.body);

  if (keys.length === 0) {
    return null;
  }

  const targetKey = keys[0];
  const currentValue = step.body[targetKey];

  return {
    label: `${step.name}: wrong type field ${targetKey}`,
    step: {
      ...step,
      body: {
        ...step.body,
        [targetKey]: mutatePrimitiveType(currentValue),
      },
    },
  };
}

function generateMutations(step: ScenarioStep): StepMutation[] {
  const mutations: Array<StepMutation | null> = [
    mutateToNull(step),
    mutateObjectMissingField(step),
    mutateLongString(step),
    mutateWrongType(step),
  ];

  return mutations.filter((entry): entry is StepMutation => entry !== null);
}

function buildFuzzedScenario(
  scenario: Scenario,
  stepIndex: number,
  mutation: StepMutation
): Scenario {
  const nextSteps = scenario.steps.map((step, index) =>
    index === stepIndex ? mutation.step : cloneStep(step)
  );

  return {
    ...scenario,
    name: `${scenario.name} [fuzz: ${mutation.label}]`,
    steps: nextSteps,
  };
}

export function generateFuzzedScenarios(
  scenario: Scenario,
  maxVariants: number
): Array<{ label: string; scenario: Scenario }> {
  const variants: Array<{ label: string; scenario: Scenario }> = [];

  for (const [stepIndex, step] of scenario.steps.entries()) {
    const mutations = generateMutations(step);

    for (const mutation of mutations) {
      variants.push({
        label: mutation.label,
        scenario: buildFuzzedScenario(scenario, stepIndex, mutation),
      });

      if (variants.length >= maxVariants) {
        return variants;
      }
    }
  }

  return variants;
}

export async function runFuzzScenarioBatch(input: {
  scenario: Scenario;
  apiConfig: ApiConfig;
  maxVariants: number;
}): Promise<FuzzRunResult[]> {
  const variants = generateFuzzedScenarios(input.scenario, input.maxVariants);
  const results: FuzzRunResult[] = [];

  for (const variant of variants) {
    const result = await runScenarioCore({
      scenario: variant.scenario,
      apiConfig: input.apiConfig,
    });

    results.push({
      label: variant.label,
      result,
    });
  }

  return results;
}
