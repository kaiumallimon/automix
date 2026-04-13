"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { fetchRunWithStepsClient } from "@/lib/runs/client";
import type { RunWithSteps } from "@/types/run-log";

interface RunStepDetailViewerProps {
  runId: string;
}

function formatTimestamp(value: string): string {
  return new Date(value).toLocaleString();
}

function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms} ms`;
  }

  return `${(ms / 1000).toFixed(2)} s`;
}

function prettyJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function RunStepDetailViewer({ runId }: RunStepDetailViewerProps) {
  const router = useRouter();
  const { user, isAuthenticated, authLoading } = useAuth();

  const [runDetail, setRunDetail] = useState<RunWithSteps | null>(null);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!isAuthenticated) {
      return;
    }

    async function loadRunDetail(): Promise<void> {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const result = await fetchRunWithStepsClient(runId);
        setRunDetail(result);
        setSelectedStepIndex(0);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load run details.";
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    }

    void loadRunDetail();
  }, [authLoading, isAuthenticated, router, runId]);

  const selectedStep = runDetail?.steps[selectedStepIndex] ?? null;

  const passedCount = useMemo(
    () => runDetail?.steps.filter((step) => step.outcome === "passed").length ?? 0,
    [runDetail]
  );

  if (authLoading || (!isAuthenticated && !user)) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <p className="text-sm text-muted-foreground">Checking authentication...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Step Detail Viewer</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {runDetail?.run.scenarioName ?? "Run Detail"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/runs"
            className="inline-flex h-8 items-center justify-center rounded-lg border border-input bg-input/30 px-3 text-sm font-medium text-foreground transition hover:bg-input/50"
          >
            Back to Runs
          </Link>
          <Button type="button" variant="outline" onClick={() => router.refresh()}>
            Refresh
          </Button>
        </div>
      </header>

      {errorMessage ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading run detail...</p>
      ) : null}

      {runDetail ? (
        <>
          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Outcome</p>
                <p
                  className={`mt-1 text-sm font-semibold ${
                    runDetail.run.outcome === "passed"
                      ? "text-emerald-700"
                      : "text-rose-700"
                  }`}
                >
                  {runDetail.run.outcome}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Duration</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {formatDuration(runDetail.run.totalExecutionTimeMs)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Step Pass Rate</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {passedCount} / {runDetail.steps.length}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Started</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {formatTimestamp(runDetail.run.startedAt)}
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <aside className="rounded-2xl border border-border bg-card p-4">
              <h2 className="mb-3 text-sm font-semibold text-card-foreground">Steps</h2>
              <div className="space-y-2">
                {runDetail.steps.map((step, index) => (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setSelectedStepIndex(index)}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                      index === selectedStepIndex
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <p className="font-medium">{step.stepName}</p>
                    <p className="mt-1 text-xs opacity-75">
                      {step.outcome} • {formatDuration(step.executionTimeMs)}
                    </p>
                  </button>
                ))}
              </div>
            </aside>

            {selectedStep ? (
              <article className="rounded-2xl border border-border bg-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-card-foreground">
                      {selectedStep.stepName}
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Step {selectedStep.stepIndex + 1}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-2 py-1 text-xs ${
                      selectedStep.outcome === "passed"
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                        : "border-rose-300 bg-rose-50 text-rose-700"
                    }`}
                  >
                    {selectedStep.outcome}
                  </span>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Expected Status
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {selectedStep.expectedStatus}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Actual Status
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {selectedStep.actualStatus ?? "N/A"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <section className="rounded-lg border border-border bg-background p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Request Snapshot
                    </p>
                    <pre className="mt-2 overflow-x-auto text-[11px] text-foreground">
                      {prettyJson(selectedStep.request)}
                    </pre>
                  </section>

                  <section className="rounded-lg border border-border bg-background p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Response Snapshot
                    </p>
                    <pre className="mt-2 overflow-x-auto text-[11px] text-foreground">
                      {prettyJson(selectedStep.response)}
                    </pre>
                  </section>

                  <section className="rounded-lg border border-border bg-background p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Expected Response
                    </p>
                    <pre className="mt-2 overflow-x-auto text-[11px] text-foreground">
                      {prettyJson(selectedStep.expectedResponse)}
                    </pre>
                  </section>

                  <section className="rounded-lg border border-border bg-background p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Variable Snapshot
                    </p>
                    <pre className="mt-2 overflow-x-auto text-[11px] text-foreground">
                      {prettyJson({
                        referencedVariables: selectedStep.referencedVariables,
                        capturedVariables: selectedStep.capturedVariables,
                      })}
                    </pre>
                  </section>
                </div>

                {selectedStep.errorMessage ? (
                  <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {selectedStep.errorMessage}
                  </p>
                ) : null}
              </article>
            ) : null}
          </section>
        </>
      ) : null}
    </main>
  );
}
