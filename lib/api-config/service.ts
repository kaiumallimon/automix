import "server-only";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  type DocumentData,
} from "firebase/firestore";

import { getFirebaseServerFirestore } from "@/lib/firebase/firestore-server";
import type {
  ApiConfig,
  ApiConfigAuthType,
  ApiConfigHeaders,
  ApiConfigInput,
  ApiConfigPatchInput,
} from "@/types/api-config";

import { parseApiConfigInput, parseApiConfigPatchInput } from "./schema";

const API_CONFIG_COLLECTION = "apiConfigs";

export class ApiConfigNotFoundError extends Error {
  constructor(apiConfigId: string) {
    super(`API config ${apiConfigId} was not found.`);
  }
}

function getCollectionRef() {
  return collection(getFirebaseServerFirestore(), API_CONFIG_COLLECTION);
}

function asObject(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`Expected ${label} to be a valid object.`);
  }

  return value as Record<string, unknown>;
}

function readString(
  source: Record<string, unknown>,
  key: string,
  fallback?: string
): string {
  const value = source[key] ?? fallback;

  if (typeof value !== "string") {
    throw new Error(`Invalid API config field: ${key}.`);
  }

  return value;
}

function readHeaders(source: Record<string, unknown>): ApiConfigHeaders {
  const rawHeaders = asObject(source.defaultHeaders, "defaultHeaders");
  const headers: ApiConfigHeaders = {};

  for (const [headerKey, headerValue] of Object.entries(rawHeaders)) {
    if (typeof headerValue !== "string") {
      throw new Error(`Invalid API config header value for ${headerKey}.`);
    }

    headers[headerKey] = headerValue;
  }

  return headers;
}

function readAuthType(source: Record<string, unknown>): ApiConfigAuthType {
  const authType = source.authType;

  if (authType !== "none" && authType !== "jwt") {
    throw new Error("Invalid API config authType.");
  }

  return authType;
}

function mapApiConfigDocument(id: string, payload: DocumentData): ApiConfig {
  const data = asObject(payload, "apiConfig document");

  return {
    id,
    userId: readString(data, "userId"),
    createdAt: readString(data, "createdAt"),
    updatedAt: readString(data, "updatedAt"),
    name: readString(data, "name"),
    baseUrl: readString(data, "baseUrl"),
    defaultHeaders: readHeaders(data),
    authType: readAuthType(data),
  };
}

export async function listApiConfigs(userId: string): Promise<ApiConfig[]> {
  const snapshot = await getDocs(
    query(getCollectionRef(), where("userId", "==", userId))
  );

  const configs = snapshot.docs.map((docSnapshot) =>
    mapApiConfigDocument(docSnapshot.id, docSnapshot.data())
  );

  return configs.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function createApiConfig(
  userId: string,
  rawInput: unknown
): Promise<ApiConfig> {
  const input = parseApiConfigInput(rawInput);
  const now = new Date().toISOString();

  const docRef = await addDoc(getCollectionRef(), {
    userId,
    name: input.name,
    baseUrl: input.baseUrl,
    defaultHeaders: input.defaultHeaders,
    authType: input.authType,
    createdAt: now,
    updatedAt: now,
  });

  return {
    id: docRef.id,
    userId,
    name: input.name,
    baseUrl: input.baseUrl,
    defaultHeaders: input.defaultHeaders,
    authType: input.authType,
    createdAt: now,
    updatedAt: now,
  };
}

async function getOwnedApiConfigOrThrow(
  userId: string,
  apiConfigId: string
): Promise<ApiConfig> {
  const docRef = doc(getCollectionRef(), apiConfigId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    throw new ApiConfigNotFoundError(apiConfigId);
  }

  const config = mapApiConfigDocument(snapshot.id, snapshot.data());

  if (config.userId !== userId) {
    throw new ApiConfigNotFoundError(apiConfigId);
  }

  return config;
}

export async function getApiConfigById(
  userId: string,
  apiConfigId: string
): Promise<ApiConfig> {
  return getOwnedApiConfigOrThrow(userId, apiConfigId);
}

export async function updateApiConfig(
  userId: string,
  apiConfigId: string,
  rawPatch: unknown
): Promise<ApiConfig> {
  const patch = parseApiConfigPatchInput(rawPatch);
  const existing = await getOwnedApiConfigOrThrow(userId, apiConfigId);

  const updated: ApiConfig = {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  await updateDoc(doc(getCollectionRef(), apiConfigId), {
    name: updated.name,
    baseUrl: updated.baseUrl,
    defaultHeaders: updated.defaultHeaders,
    authType: updated.authType,
    updatedAt: updated.updatedAt,
  });

  return updated;
}

export async function deleteApiConfig(
  userId: string,
  apiConfigId: string
): Promise<void> {
  await getOwnedApiConfigOrThrow(userId, apiConfigId);
  await deleteDoc(doc(getCollectionRef(), apiConfigId));
}

export function parseApiConfigForCreate(rawInput: unknown): ApiConfigInput {
  return parseApiConfigInput(rawInput);
}

export function parseApiConfigForPatch(rawInput: unknown): ApiConfigPatchInput {
  return parseApiConfigPatchInput(rawInput);
}
