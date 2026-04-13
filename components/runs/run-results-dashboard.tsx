"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { fetchRunsClient } from "@/lib/runs/client";
import type { RunRecord } from "@/types/run-log";

function formatTimestamp(value: string): string {
  return new Date(value).toLocaleString();
}

function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms} ms`;
  }

  const seconds = (ms / 1000).toFixed(2);
  return `${seconds} s`;
}

export function RunResultsDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, authLoading, logout } = useAuth();

  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadRuns = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const loadedRuns = await fetchRunsClient();
      setRuns(loadedRuns);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load run results.";
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
      void loadRuns();
    }
  }, [authLoading, isAuthenticated, loadRuns, router]);

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

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Results Dashboard</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Scenario Runs
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => void loadRuns()}>
            Refresh
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      {errorMessage ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}

      <section className="rounded-2xl border border-border bg-card p-6">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading run history...</p>
        ) : runs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No runs found. Trigger a scenario run from the Scenario Builder.
          </p>
        ) : (
          <div className="space-y-3">
            {runs.map((run) => (
              <article
                key={run.id}
                className="rounded-xl border border-border bg-muted/40 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">
                      {run.scenarioName}
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Started: {formatTimestamp(run.startedAt)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Finished: {formatTimestamp(run.finishedAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex rounded-full border px-2 py-1 text-xs ${
                        run.outcome === "passed"
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : "border-rose-300 bg-rose-50 text-rose-700"
                      }`}
                    >
                      {run.outcome}
                    </span>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Duration: {formatDuration(run.totalExecutionTimeMs)}
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <Link
                    href={`/runs/${run.id}`}
                    className="inline-flex h-8 items-center justify-center rounded-lg border border-input bg-input/30 px-3 text-sm font-medium text-foreground transition hover:bg-input/50"
                  >
                    View Step Results
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
