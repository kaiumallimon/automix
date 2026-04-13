"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchScenarioByIdClient,
  updateScenarioClient,
} from "@/lib/scenario/client";
import { extractVariablesFromStepSource } from "@/lib/scenario/variable-syntax";
import type {
  Scenario,
  ScenarioHeaders,
  ScenarioHttpMethod,
  ScenarioJsonObject,
  ScenarioJsonValue,
  ScenarioStep,
  ScenarioVariableCaptureMap,
} from "@/types/scenario";

interface StepEditorProps {
  scenarioId: string;
}

interface ScenarioStepDraft {
  id: string;
  name: string;
  method: ScenarioHttpMethod;
  endpoint: string;
  headersText: string;
  bodyText: string;
  expectedStatusText: string;
  expectedResponseText: string;
  captureText: string;
}

const SCENARIO_METHODS: ScenarioHttpMethod[] = ["GET", "POST", "PATCH", "DELETE"];

function stringifyJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function makeStepDraft(step: ScenarioStep): ScenarioStepDraft {
  return {
    id: step.id,
    name: step.name,
    method: step.method,
    endpoint: step.endpoint,
    headersText: stringifyJson(step.headers),
    bodyText: stringifyJson(step.body),
    expectedStatusText: String(step.expectedStatus),
    expectedResponseText: stringifyJson(step.expectedResponse),
    captureText: stringifyJson(step.capture),
  };
}

function createEmptyStepDraft(index: number): ScenarioStepDraft {
  return {
    id: `step_${index + 1}`,
    name: `Step ${index + 1}`,
    method: "GET",
    endpoint: "/",
    headersText: "{}",
    bodyText: "null",
    expectedStatusText: "200",
    expectedResponseText: "{}",
    captureText: "{}",
  };
}

function parseJsonObject(value: string, label: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(value);

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error(`${label} must be a JSON object.`);
  }

  return parsed as Record<string, unknown>;
}

function parseHeaders(value: string): ScenarioHeaders {
  const parsed = parseJsonObject(value, "Headers");
  const headers: ScenarioHeaders = {};

  for (const [key, entryValue] of Object.entries(parsed)) {
    if (typeof entryValue !== "string") {
      throw new Error(`Header value for ${key} must be a string.`);
    }

    headers[key] = entryValue;
  }

  return headers;
}

function parseCapture(value: string): ScenarioVariableCaptureMap {
  const parsed = parseJsonObject(value, "Capture map");
  const capture: ScenarioVariableCaptureMap = {};

  for (const [variableName, path] of Object.entries(parsed)) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(variableName)) {
      throw new Error(`Capture variable ${variableName} has invalid syntax.`);
    }

    if (typeof path !== "string" || path.trim().length === 0) {
      throw new Error(`Capture path for ${variableName} must be a non-empty string.`);
    }

    capture[variableName] = path.trim();
  }

  return capture;
}

function parseExpectedResponse(value: string): ScenarioJsonObject {
  const parsed: unknown = JSON.parse(value);

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("Expected response must be a JSON object.");
  }

  return parsed as ScenarioJsonObject;
}

function parseBody(value: string): ScenarioJsonValue {
  return JSON.parse(value) as ScenarioJsonValue;
}

function parseStatus(value: string): number {
  const numeric = Number(value);

  if (!Number.isInteger(numeric) || numeric < 100 || numeric > 599) {
    throw new Error("Expected status must be an integer between 100 and 599.");
  }

  return numeric;
}

function parseDraft(draft: ScenarioStepDraft, index: number): ScenarioStep {
  if (!draft.name.trim()) {
    throw new Error(`Step ${index + 1} name is required.`);
  }

  if (!draft.endpoint.trim()) {
    throw new Error(`Step ${index + 1} endpoint is required.`);
  }

  return {
    id: draft.id.trim() || `step_${index + 1}`,
    name: draft.name.trim(),
    method: draft.method,
    endpoint: draft.endpoint.trim(),
    headers: parseHeaders(draft.headersText),
    body: parseBody(draft.bodyText),
    expectedStatus: parseStatus(draft.expectedStatusText),
    expectedResponse: parseExpectedResponse(draft.expectedResponseText),
    capture: parseCapture(draft.captureText),
  };
}

export function StepEditor({ scenarioId }: StepEditorProps) {
  const router = useRouter();
  const { user, isAuthenticated, authLoading } = useAuth();

  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [stepDrafts, setStepDrafts] = useState<ScenarioStepDraft[]>([]);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!isAuthenticated) {
      return;
    }

    async function loadScenario(): Promise<void> {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const loadedScenario = await fetchScenarioByIdClient(scenarioId);
        setScenario(loadedScenario);
        setStepDrafts(loadedScenario.steps.map((step) => makeStepDraft(step)));
        setSelectedStepIndex(0);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load scenario.";
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    }

    void loadScenario();
  }, [authLoading, isAuthenticated, router, scenarioId]);

  const selectedStep = stepDrafts[selectedStepIndex] ?? null;

  const availableVariables = useMemo(() => {
    const variables = new Set<string>();

    for (const draft of stepDrafts.slice(0, selectedStepIndex)) {
      try {
        const capture = parseCapture(draft.captureText);
        for (const variableName of Object.keys(capture)) {
          variables.add(variableName);
        }
      } catch {
        // Ignore invalid drafts while still editing.
      }
    }

    return Array.from(variables);
  }, [selectedStepIndex, stepDrafts]);

  const referencedVariables = useMemo(() => {
    if (!selectedStep) {
      return [];
    }

    return extractVariablesFromStepSource(
      selectedStep.endpoint,
      selectedStep.headersText,
      selectedStep.bodyText
    );
  }, [selectedStep]);

  const unresolvedVariables = useMemo(
    () =>
      referencedVariables.filter(
        (variableName) => !availableVariables.includes(variableName)
      ),
    [availableVariables, referencedVariables]
  );

  if (authLoading || (!isAuthenticated && !user)) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <p className="text-sm text-muted-foreground">Checking authentication...</p>
      </main>
    );
  }

  function updateSelectedDraft(
    key: keyof ScenarioStepDraft,
    value: string
  ): void {
    setStepDrafts((current) => {
      const next = [...current];
      const draft = next[selectedStepIndex];

      if (!draft) {
        return current;
      }

      next[selectedStepIndex] = {
        ...draft,
        [key]: value,
      };

      return next;
    });
  }

  function addStep(): void {
    setStepDrafts((current) => {
      const next = [...current, createEmptyStepDraft(current.length)];
      setSelectedStepIndex(next.length - 1);
      return next;
    });
    setSuccessMessage(null);
  }

  function removeSelectedStep(): void {
    if (stepDrafts.length <= 1) {
      setErrorMessage("A scenario must contain at least one step.");
      return;
    }

    setStepDrafts((current) => {
      const next = current.filter((_, index) => index !== selectedStepIndex);
      setSelectedStepIndex(Math.max(0, selectedStepIndex - 1));
      return next;
    });
  }

  function moveStep(direction: "up" | "down"): void {
    const targetIndex = direction === "up" ? selectedStepIndex - 1 : selectedStepIndex + 1;

    if (targetIndex < 0 || targetIndex >= stepDrafts.length) {
      return;
    }

    setStepDrafts((current) => {
      const next = [...current];
      const currentStep = next[selectedStepIndex];
      const targetStep = next[targetIndex];

      next[selectedStepIndex] = targetStep;
      next[targetIndex] = currentStep;

      return next;
    });
    setSelectedStepIndex(targetIndex);
  }

  async function saveSteps(): Promise<void> {
    if (!scenario) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const parsedSteps = stepDrafts.map((draft, index) => parseDraft(draft, index));

      await updateScenarioClient(scenario.id, { steps: parsedSteps });

      setScenario((current) =>
        current
          ? {
              ...current,
              steps: parsedSteps,
              updatedAt: new Date().toISOString(),
            }
          : current
      );

      setSuccessMessage("Step configuration saved.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save scenario steps.";
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Step Editor</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {scenario?.name ?? "Scenario"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/scenarios"
            className="inline-flex h-8 items-center justify-center rounded-lg border border-input bg-input/30 px-3 text-sm font-medium text-foreground transition hover:bg-input/50"
          >
            Back to Scenarios
          </Link>
          <Button onClick={() => void saveSteps()} disabled={isSaving || isLoading}>
            {isSaving ? "Saving..." : "Save Steps"}
          </Button>
        </div>
      </header>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading scenario steps...</p>
      ) : null}

      {errorMessage ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}

      {successMessage ? (
        <p className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {successMessage}
        </p>
      ) : null}

      {selectedStep ? (
        <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-card-foreground">Steps</h2>
              <Button type="button" size="xs" onClick={addStep}>
                Add
              </Button>
            </div>

            <div className="space-y-2">
              {stepDrafts.map((step, index) => (
                <button
                  key={`${step.id}_${index}`}
                  type="button"
                  onClick={() => setSelectedStepIndex(index)}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                    selectedStepIndex === index
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <p className="font-medium">{step.name || `Step ${index + 1}`}</p>
                  <p className="mt-1 text-xs opacity-75">{step.method} {step.endpoint}</p>
                </button>
              ))}
            </div>
          </aside>

          <article className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-card-foreground">
                Edit Step {selectedStepIndex + 1}
              </h2>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => moveStep("up")}
                  disabled={selectedStepIndex === 0}
                >
                  Move Up
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => moveStep("down")}
                  disabled={selectedStepIndex === stepDrafts.length - 1}
                >
                  Move Down
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={removeSelectedStep}
                >
                  Remove
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-foreground">Step Name</span>
                <input
                  value={selectedStep.name}
                  onChange={(event) => updateSelectedDraft("name", event.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-foreground">Step ID</span>
                <input
                  value={selectedStep.id}
                  onChange={(event) => updateSelectedDraft("id", event.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-foreground">Method</span>
                <select
                  value={selectedStep.method}
                  onChange={(event) =>
                    updateSelectedDraft("method", event.target.value as ScenarioHttpMethod)
                  }
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                >
                  {SCENARIO_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-foreground">Endpoint</span>
                <input
                  value={selectedStep.endpoint}
                  onChange={(event) =>
                    updateSelectedDraft("endpoint", event.target.value)
                  }
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                  placeholder="/issues/{{issueId}}"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-foreground">Expected Status</span>
                <input
                  value={selectedStep.expectedStatusText}
                  onChange={(event) =>
                    updateSelectedDraft("expectedStatusText", event.target.value)
                  }
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-foreground">Headers (JSON)</span>
                <textarea
                  rows={8}
                  value={selectedStep.headersText}
                  onChange={(event) =>
                    updateSelectedDraft("headersText", event.target.value)
                  }
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-xs text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-foreground">Body (JSON)</span>
                <textarea
                  rows={8}
                  value={selectedStep.bodyText}
                  onChange={(event) => updateSelectedDraft("bodyText", event.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-xs text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-foreground">Expected Response (JSON)</span>
                <textarea
                  rows={8}
                  value={selectedStep.expectedResponseText}
                  onChange={(event) =>
                    updateSelectedDraft("expectedResponseText", event.target.value)
                  }
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-xs text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-foreground">Capture Variables (JSON)</span>
                <textarea
                  rows={8}
                  value={selectedStep.captureText}
                  onChange={(event) =>
                    updateSelectedDraft("captureText", event.target.value)
                  }
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-xs text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                  placeholder='{"token":"data.token"}'
                />
              </label>
            </div>

            <div className="mt-5 rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-sm font-medium text-foreground">
                Variable Syntax: use {"{{variableName}}"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Referenced variables are detected from endpoint, headers, and body.
                Variables become available after a previous step captures them.
              </p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Available From Previous Steps
                  </p>
                  <p className="mt-1 text-xs text-foreground">
                    {availableVariables.length > 0
                      ? availableVariables.join(", ")
                      : "No variables captured yet."}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Referenced In This Step
                  </p>
                  <p className="mt-1 text-xs text-foreground">
                    {referencedVariables.length > 0
                      ? referencedVariables.join(", ")
                      : "No variable references found."}
                  </p>
                </div>
              </div>

              {unresolvedVariables.length > 0 ? (
                <p className="mt-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  Unresolved references: {unresolvedVariables.join(", ")}
                </p>
              ) : null}
            </div>
          </article>
        </section>
      ) : null}
    </main>
  );
}
