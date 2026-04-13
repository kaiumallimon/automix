"use client";

import type { Scenario, ScenarioInput, ScenarioPatchInput } from "@/types/scenario";

interface ApiResponse<T> {
  data: T;
}

interface ApiErrorResponse {
  error?: unknown;
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

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function fetchScenariosClient(): Promise<Scenario[]> {
  const payload = await requestJson<ApiResponse<Scenario[]>>("/api/scenarios", {
    method: "GET",
  });

  return payload.data;
}

export async function createScenarioClient(
  input: ScenarioInput
): Promise<Scenario> {
  const payload = await requestJson<ApiResponse<Scenario>>("/api/scenarios", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return payload.data;
}

export async function updateScenarioClient(
  scenarioId: string,
  patch: ScenarioPatchInput
): Promise<Scenario> {
  const payload = await requestJson<ApiResponse<Scenario>>(
    `/api/scenarios/${scenarioId}`,
    {
      method: "PATCH",
      body: JSON.stringify(patch),
    }
  );

  return payload.data;
}

export async function deleteScenarioClient(scenarioId: string): Promise<void> {
  await requestJson<{ ok: boolean }>(`/api/scenarios/${scenarioId}`, {
    method: "DELETE",
  });
}

export async function fetchScenarioByIdClient(
  scenarioId: string
): Promise<Scenario> {
  const payload = await requestJson<ApiResponse<Scenario>>(
    `/api/scenarios/${scenarioId}`,
    {
      method: "GET",
    }
  );

  return payload.data;
}
