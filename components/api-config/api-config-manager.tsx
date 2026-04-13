"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  createApiConfigClient,
  deleteApiConfigClient,
  fetchApiConfigs,
  updateApiConfigClient,
} from "@/lib/api-config/client";
import type {
  ApiConfig,
  ApiConfigAuthType,
  ApiConfigHeaders,
  ApiConfigInput,
} from "@/types/api-config";

interface FormState {
  name: string;
  baseUrl: string;
  defaultHeadersText: string;
  authType: ApiConfigAuthType;
}

const INITIAL_FORM_STATE: FormState = {
  name: "",
  baseUrl: "",
  defaultHeadersText: "{}",
  authType: "none",
};

function stringifyHeaders(headers: ApiConfigHeaders): string {
  return JSON.stringify(headers, null, 2);
}

function parseHeadersFromText(text: string): ApiConfigHeaders {
  const parsed: unknown = JSON.parse(text);

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("Default headers must be a JSON object.");
  }

  const normalized: ApiConfigHeaders = {};

  for (const [key, value] of Object.entries(parsed)) {
    if (typeof value !== "string") {
      throw new Error(`Header value for ${key} must be a string.`);
    }

    normalized[key] = value;
  }

  return normalized;
}

export function ApiConfigManager() {
  const router = useRouter();
  const { user, isAuthenticated, authLoading, logout } = useAuth();

  const [apiConfigs, setApiConfigs] = useState<ApiConfig[]>([]);
  const [isLoadingConfigs, setIsLoadingConfigs] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);

  const isBusy = isSaving || isLoadingConfigs;

  const loadConfigs = useCallback(async () => {
    setIsLoadingConfigs(true);
    setErrorMessage(null);

    try {
      const configs = await fetchApiConfigs();
      setApiConfigs(configs);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load API configs.";
      setErrorMessage(message);
    } finally {
      setIsLoadingConfigs(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (isAuthenticated) {
      void loadConfigs();
    }
  }, [authLoading, isAuthenticated, loadConfigs, router]);

  const formTitle = useMemo(
    () => (editingId ? "Update API Config" : "Create API Config"),
    [editingId]
  );

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
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const payload: ApiConfigInput = {
        name: formState.name,
        baseUrl: formState.baseUrl,
        defaultHeaders: parseHeadersFromText(formState.defaultHeadersText),
        authType: formState.authType,
      };

      if (editingId) {
        await updateApiConfigClient(editingId, payload);
      } else {
        await createApiConfigClient(payload);
      }

      setFormState(INITIAL_FORM_STATE);
      setEditingId(null);
      await loadConfigs();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to save API config.";
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  }

  function startEdit(config: ApiConfig): void {
    setEditingId(config.id);
    setFormState({
      name: config.name,
      baseUrl: config.baseUrl,
      defaultHeadersText: stringifyHeaders(config.defaultHeaders),
      authType: config.authType,
    });
    setErrorMessage(null);
  }

  function resetForm(): void {
    setEditingId(null);
    setFormState(INITIAL_FORM_STATE);
    setErrorMessage(null);
  }

  async function handleDelete(config: ApiConfig): Promise<void> {
    const shouldDelete = window.confirm(
      `Delete API config "${config.name}"? This cannot be undone.`
    );

    if (!shouldDelete) {
      return;
    }

    setIsDeletingId(config.id);
    setErrorMessage(null);

    try {
      await deleteApiConfigClient(config.id);

      if (editingId === config.id) {
        resetForm();
      }

      await loadConfigs();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete API config.";
      setErrorMessage(message);
    } finally {
      setIsDeletingId(null);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">API Configuration Module</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Manage API Configs
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
              <span className="text-sm font-medium text-foreground">Name</span>
              <input
                required
                minLength={2}
                maxLength={80}
                value={formState.name}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                placeholder="Internal API Name"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground">Base URL</span>
              <input
                required
                value={formState.baseUrl}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    baseUrl: event.target.value,
                  }))
                }
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                placeholder="https://api.example.com"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground">Auth Type</span>
              <select
                value={formState.authType}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    authType: event.target.value as ApiConfigAuthType,
                  }))
                }
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                <option value="none">none</option>
                <option value="jwt">jwt</option>
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground">Default Headers (JSON)</span>
              <textarea
                rows={8}
                value={formState.defaultHeadersText}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    defaultHeadersText: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-xs text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
              />
            </label>

            {errorMessage ? (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {errorMessage}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={isBusy}>
                {isSaving
                  ? "Saving..."
                  : editingId
                    ? "Update Config"
                    : "Create Config"}
              </Button>
              {editingId ? (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel Edit
                </Button>
              ) : null}
            </div>
          </form>
        </article>

        <article className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-card-foreground">Saved Configurations</h2>
          <div className="mt-4 space-y-3">
            {isLoadingConfigs ? (
              <p className="text-sm text-muted-foreground">Loading configs...</p>
            ) : apiConfigs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No API configs yet. Create your first one from the form.
              </p>
            ) : (
              apiConfigs.map((config) => (
                <div
                  key={config.id}
                  className="rounded-xl border border-border bg-muted/40 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{config.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{config.baseUrl}</p>
                    </div>
                    <span className="rounded-full border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
                      {config.authType}
                    </span>
                  </div>

                  <pre className="mt-3 overflow-x-auto rounded-lg border border-border bg-background p-3 text-[11px] text-foreground">
                    {stringifyHeaders(config.defaultHeaders)}
                  </pre>

                  <div className="mt-3 flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(config)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => void handleDelete(config)}
                      disabled={isDeletingId === config.id}
                    >
                      {isDeletingId === config.id ? "Deleting..." : "Delete"}
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
