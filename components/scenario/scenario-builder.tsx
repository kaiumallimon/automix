"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchApiConfigs,
} from "@/lib/api-config/client";
import {
  createScenarioClient,
  deleteScenarioClient,
  fetchScenariosClient,
  updateScenarioClient,
} from "@/lib/scenario/client";
import { triggerScenarioRunClient } from "@/lib/runs/client";
import type { ApiConfig } from "@/types/api-config";
import type { Scenario, ScenarioStep } from "@/types/scenario";

interface BuilderFormState {
  apiConfigId: string;
  name: string;
  description: string;
}

const INITIAL_FORM_STATE: BuilderFormState = {
  apiConfigId: "",
  name: "",
  description: "",
};

function makeDefaultScenarioStep(): ScenarioStep {
  return {
    id: "step_1",
    name: "Initial Step",
    method: "GET",
    endpoint: "/",
    headers: {},
    body: null,
    expectedStatus: 200,
    expectedResponse: {},
    capture: {},
  };
}

export function ScenarioBuilder() {
  const router = useRouter();
  const { user, isAuthenticated, authLoading, logout } = useAuth();

  const [apiConfigs, setApiConfigs] = useState<ApiConfig[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  const [formState, setFormState] = useState<BuilderFormState>(INITIAL_FORM_STATE);
  const [editingScenarioId, setEditingScenarioId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isRunningScenarioId, setIsRunningScenarioId] = useState<string | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formTitle = useMemo(
    () => (editingScenarioId ? "Update Scenario Metadata" : "Create Scenario"),
    [editingScenarioId]
  );

  const isBusy = isLoading || isSaving;

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [loadedConfigs, loadedScenarios] = await Promise.all([
        fetchApiConfigs(),
        fetchScenariosClient(),
      ]);

      setApiConfigs(loadedConfigs);
      setScenarios(loadedScenarios);

      setFormState((current) => ({
        ...current,
        apiConfigId:
          current.apiConfigId || loadedConfigs[0]?.id || INITIAL_FORM_STATE.apiConfigId,
      }));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load scenario builder data.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (isAuthenticated) {
      void loadData();
    }
  }, [authLoading, isAuthenticated, loadData, router]);

  if (authLoading || (!isAuthenticated && !user)) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <p className="text-sm text-muted-foreground">Checking authentication...</p>
      </main>
    );
  }

  async function handleLogout(): Promise<void> {
    await logout();
    router.replace("/login");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!formState.apiConfigId) {
      setErrorMessage("Select an API config first.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      if (editingScenarioId) {
        await updateScenarioClient(editingScenarioId, {
          apiConfigId: formState.apiConfigId,
          name: formState.name,
          description: formState.description.trim() || null,
        });
      } else {
        await createScenarioClient({
          apiConfigId: formState.apiConfigId,
          name: formState.name,
          description: formState.description.trim() || null,
          steps: [makeDefaultScenarioStep()],
        });
      }

      resetForm();
      await loadData();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to save scenario.";
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  }

  function resetForm(): void {
    setEditingScenarioId(null);
    setFormState((current) => ({
      ...INITIAL_FORM_STATE,
      apiConfigId: current.apiConfigId || apiConfigs[0]?.id || "",
    }));
  }

  function startEditScenario(scenario: Scenario): void {
    setEditingScenarioId(scenario.id);
    setFormState({
      apiConfigId: scenario.apiConfigId,
      name: scenario.name,
      description: scenario.description ?? "",
    });
    setErrorMessage(null);
  }

  async function handleDeleteScenario(scenario: Scenario): Promise<void> {
    const shouldDelete = window.confirm(
      `Delete scenario "${scenario.name}" and all linked runs?`
    );

    if (!shouldDelete) {
      return;
    }

    setIsDeletingId(scenario.id);
    setErrorMessage(null);

    try {
      await deleteScenarioClient(scenario.id);

      if (editingScenarioId === scenario.id) {
        resetForm();
      }

      await loadData();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete scenario.";
      setErrorMessage(message);
    } finally {
      setIsDeletingId(null);
    }
  }

  async function handleRunScenario(scenario: Scenario): Promise<void> {
    setIsRunningScenarioId(scenario.id);
    setErrorMessage(null);

    try {
      const result = await triggerScenarioRunClient(scenario.id);

      if (result.mode === "single" && result.run) {
        router.push(`/runs/${result.run.id}`);
      } else {
        router.push("/runs");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to execute scenario.";
      setErrorMessage(message);
    } finally {
      setIsRunningScenarioId(null);
    }
  }

  async function handleRunFuzzScenario(scenario: Scenario): Promise<void> {
    setIsRunningScenarioId(scenario.id);
    setErrorMessage(null);

    try {
      await triggerScenarioRunClient(scenario.id, {
        fuzz: true,
        maxVariants: 4,
      });

      router.push("/runs");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to execute fuzz scenario runs.";
      setErrorMessage(message);
    } finally {
      setIsRunningScenarioId(null);
    }
  }

  function apiConfigLabel(apiConfigId: string): string {
    const found = apiConfigs.find((config) => config.id === apiConfigId);

    return found ? found.name : "Unknown API config";
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Scenario Builder</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Build and Manage Scenarios
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_1.2fr]">
        <article className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-card-foreground">{formTitle}</h2>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground">API Config</span>
              <select
                required
                value={formState.apiConfigId}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    apiConfigId: event.target.value,
                  }))
                }
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                {apiConfigs.length === 0 ? (
                  <option value="">Create an API config first</option>
                ) : null}
                {apiConfigs.map((config) => (
                  <option key={config.id} value={config.id}>
                    {config.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground">Scenario Name</span>
              <input
                required
                minLength={2}
                maxLength={120}
                value={formState.name}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                placeholder="Login and create issue"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground">Description</span>
              <textarea
                rows={4}
                value={formState.description}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                placeholder="High-level intent of this scenario"
              />
            </label>

            {errorMessage ? (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {errorMessage}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={isBusy || apiConfigs.length === 0}>
                {isSaving
                  ? "Saving..."
                  : editingScenarioId
                    ? "Update Scenario"
                    : "Create Scenario"}
              </Button>
              {editingScenarioId ? (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel Edit
                </Button>
              ) : null}
            </div>
          </form>
        </article>

        <article className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-card-foreground">Saved Scenarios</h2>
          <div className="mt-4 space-y-3">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading scenarios...</p>
            ) : scenarios.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No scenarios yet. Create your first one from the form.
              </p>
            ) : (
              scenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className="rounded-xl border border-border bg-muted/40 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {scenario.name}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {apiConfigLabel(scenario.apiConfigId)}
                      </p>
                    </div>
                    <span className="rounded-full border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
                      {scenario.steps.length} steps
                    </span>
                  </div>

                  {scenario.description ? (
                    <p className="mt-3 text-xs leading-6 text-muted-foreground">
                      {scenario.description}
                    </p>
                  ) : null}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => startEditScenario(scenario)}
                    >
                      Edit Metadata
                    </Button>
                    <Link
                      href={`/scenarios/${scenario.id}`}
                      className="inline-flex h-7 items-center justify-center rounded-[min(var(--radius-md),12px)] border border-input bg-input/30 px-2.5 text-[0.8rem] font-medium text-foreground transition hover:bg-input/50"
                    >
                      Open Step Editor
                    </Link>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => void handleRunScenario(scenario)}
                      disabled={isRunningScenarioId === scenario.id}
                    >
                      {isRunningScenarioId === scenario.id ? "Running..." : "Run Now"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void handleRunFuzzScenario(scenario)}
                      disabled={isRunningScenarioId === scenario.id}
                    >
                      {isRunningScenarioId === scenario.id
                        ? "Running..."
                        : "Run Fuzz"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => void handleDeleteScenario(scenario)}
                      disabled={isDeletingId === scenario.id}
                    >
                      {isDeletingId === scenario.id ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </main>
  );
}
