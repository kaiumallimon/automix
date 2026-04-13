"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
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

function ConfigListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={`api-config-skeleton-${index}`}
          className="rounded-xl border border-border bg-muted/40 p-4"
        >
          <Skeleton className="h-4 w-36" />
          <Skeleton className="mt-2 h-3 w-48" />
          <Skeleton className="mt-4 h-24 w-full rounded-lg" />
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-7 w-14" />
            <Skeleton className="h-7 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ApiConfigManager() {
  const router = useRouter();
  const { user, isAuthenticated, authLoading } = useAuth();

  const [apiConfigs, setApiConfigs] = useState<ApiConfig[]>([]);
  const [isLoadingConfigs, setIsLoadingConfigs] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);

  const isBusy = isSaving || isLoadingConfigs;

  const loadConfigs = useCallback(async () => {
    setIsLoadingConfigs(true);

    try {
      const configs = await fetchApiConfigs();
      setApiConfigs(configs);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load API configs.";
      toast.error(message);
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
        <div className="w-full max-w-md space-y-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      </main>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setIsSaving(true);

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
      toast.success(editingId ? "API config updated." : "API config created.");
      await loadConfigs();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to save API config.";
      toast.error(message);
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
  }

  function resetForm(): void {
    setEditingId(null);
    setFormState(INITIAL_FORM_STATE);
  }

  async function handleDelete(config: ApiConfig): Promise<void> {
    const shouldDelete = window.confirm(
      `Delete API config "${config.name}"? This cannot be undone.`
    );

    if (!shouldDelete) {
      return;
    }

    setIsDeletingId(config.id);

    try {
      await deleteApiConfigClient(config.id);

      if (editingId === config.id) {
        resetForm();
      }

      toast.success("API config deleted.");
      await loadConfigs();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete API config.";
      toast.error(message);
    } finally {
      setIsDeletingId(null);
    }
  }

  return (
    <main className="flex w-full flex-1 flex-col gap-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">API Configuration Module</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Manage API Configs
          </h1>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_1.2fr]">
        <article className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-card-foreground">{formTitle}</h2>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="api-config-name">Name</Label>
              <Input
                id="api-config-name"
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
                placeholder="Internal API Name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-config-base-url">Base URL</Label>
              <Input
                id="api-config-base-url"
                required
                value={formState.baseUrl}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    baseUrl: event.target.value,
                  }))
                }
                placeholder="https://api.example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-config-auth-type">Auth Type</Label>
              <Select
                value={formState.authType}
                onValueChange={(value) =>
                  setFormState((current) => ({
                    ...current,
                    authType:
                      value === "none" || value === "jwt"
                        ? value
                        : current.authType,
                  }))
                }
              >
                <SelectTrigger id="api-config-auth-type" className="w-full">
                  <SelectValue placeholder="Select auth type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">none</SelectItem>
                  <SelectItem value="jwt">jwt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-config-default-headers">Default Headers (JSON)</Label>
              <Textarea
                id="api-config-default-headers"
                rows={8}
                value={formState.defaultHeadersText}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    defaultHeadersText: event.target.value,
                  }))
                }
                className="min-h-40 font-mono text-xs"
              />
            </div>

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
              <ConfigListSkeleton />
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
