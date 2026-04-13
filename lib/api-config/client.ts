"use client";

import type {
  ApiConfig,
  ApiConfigInput,
  ApiConfigPatchInput,
} from "@/types/api-config";

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

export async function fetchApiConfigs(): Promise<ApiConfig[]> {
  const payload = await requestJson<ApiResponse<ApiConfig[]>>("/api/api-configs", {
    method: "GET",
  });

  return payload.data;
}

export async function createApiConfigClient(
  input: ApiConfigInput
): Promise<ApiConfig> {
  const payload = await requestJson<ApiResponse<ApiConfig>>("/api/api-configs", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return payload.data;
}

export async function updateApiConfigClient(
  apiConfigId: string,
  patch: ApiConfigPatchInput
): Promise<ApiConfig> {
  const payload = await requestJson<ApiResponse<ApiConfig>>(
    `/api/api-configs/${apiConfigId}`,
    {
      method: "PATCH",
      body: JSON.stringify(patch),
    }
  );

  return payload.data;
}

export async function deleteApiConfigClient(apiConfigId: string): Promise<void> {
  await requestJson<{ ok: boolean }>(`/api/api-configs/${apiConfigId}`, {
    method: "DELETE",
  });
}
