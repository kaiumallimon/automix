"use client";

import type { ScenarioRunResult } from "@/types/run";
import type { RunRecord, RunWithSteps } from "@/types/run-log";

interface ApiResponse<T> {
  data: T;
}

interface ApiErrorResponse {
  error?: unknown;
}

export interface TriggerRunResponse {
  mode: "single" | "fuzz";
  run?: RunRecord;
  summary?: ScenarioRunResult;
  runs?: Array<{
    label: string;
    run: RunRecord;
    summary: ScenarioRunResult;
  }>;
}

interface TriggerRunOptions {
  fuzz?: boolean;
  maxVariants?: number;
}

async function requestJson<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}.`;

    try {
      const payload = (await response.json()) as ApiErrorResponse;
      if (typeof payload.error === "string") {
        message = payload.error;
      }
    } catch {
      message = `Request failed with status ${response.status}.`;
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function fetchRunsClient(scenarioId?: string): Promise<RunRecord[]> {
  const searchParams = new URLSearchParams();

  if (scenarioId) {
    searchParams.set("scenarioId", scenarioId);
  }

  const querySuffix = searchParams.toString();
  const url = querySuffix.length > 0 ? `/api/runs?${querySuffix}` : "/api/runs";

  const payload = await requestJson<ApiResponse<RunRecord[]>>(url, {
    method: "GET",
  });

  return payload.data;
}

export async function fetchRunWithStepsClient(runId: string): Promise<RunWithSteps> {
  const payload = await requestJson<ApiResponse<RunWithSteps>>(`/api/runs/${runId}`, {
    method: "GET",
  });

  return payload.data;
}

export async function triggerScenarioRunClient(
  scenarioId: string,
  options?: TriggerRunOptions
): Promise<TriggerRunResponse> {
  const payload = await requestJson<ApiResponse<TriggerRunResponse>>(
    `/api/scenarios/${scenarioId}/run`,
    {
      method: "POST",
      body: JSON.stringify({
        fuzz: options?.fuzz ?? false,
        maxVariants: options?.maxVariants,
      }),
    }
  );

  return payload.data;
}
