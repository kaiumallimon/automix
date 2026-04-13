import type {
  ApiConfigAuthType,
  ApiConfigHeaders,
  ApiConfigInput,
  ApiConfigPatchInput,
} from "@/types/api-config";

const API_CONFIG_AUTH_TYPES: ReadonlySet<ApiConfigAuthType> = new Set([
  "none",
  "jwt",
]);

export class ApiConfigValidationError extends Error {
  constructor(message: string) {
    super(message);
  }
}

function readObject(value: unknown, fieldName: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ApiConfigValidationError(`${fieldName} must be a JSON object.`);
  }

  return value as Record<string, unknown>;
}

function parseName(value: unknown, required: boolean): string | undefined {
  if (value === undefined && !required) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new ApiConfigValidationError("name must be a string.");
  }

  const normalized = value.trim();

  if (normalized.length < 2 || normalized.length > 80) {
    throw new ApiConfigValidationError(
      "name must be between 2 and 80 characters."
    );
  }

  return normalized;
}

function normalizeBaseUrl(raw: string): string {
  const parsed = new URL(raw);

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new ApiConfigValidationError("baseUrl must use http or https.");
  }

  const pathname = parsed.pathname.endsWith("/")
    ? parsed.pathname.slice(0, -1)
    : parsed.pathname;

  parsed.pathname = pathname;

  return parsed.toString();
}

function parseBaseUrl(value: unknown, required: boolean): string | undefined {
  if (value === undefined && !required) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new ApiConfigValidationError("baseUrl must be a string.");
  }

  const normalized = value.trim();

  if (normalized.length === 0) {
    throw new ApiConfigValidationError("baseUrl cannot be empty.");
  }

  try {
    return normalizeBaseUrl(normalized);
  } catch {
    throw new ApiConfigValidationError("baseUrl must be a valid URL.");
  }
}

function parseHeaders(
  value: unknown,
  required: boolean
): ApiConfigHeaders | undefined {
  if (value === undefined && !required) {
    return undefined;
  }

  const headers = readObject(value, "defaultHeaders");
  const normalizedHeaders: ApiConfigHeaders = {};

  for (const [headerName, headerValue] of Object.entries(headers)) {
    const normalizedName = headerName.trim();

    if (!normalizedName) {
      throw new ApiConfigValidationError(
        "defaultHeaders keys cannot be empty strings."
      );
    }

    if (typeof headerValue !== "string") {
      throw new ApiConfigValidationError(
        `defaultHeaders.${normalizedName} must be a string.`
      );
    }

    normalizedHeaders[normalizedName] = headerValue;
  }

  return normalizedHeaders;
}

function parseAuthType(
  value: unknown,
  required: boolean
): ApiConfigAuthType | undefined {
  if (value === undefined && !required) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new ApiConfigValidationError("authType must be a string.");
  }

  if (!API_CONFIG_AUTH_TYPES.has(value as ApiConfigAuthType)) {
    throw new ApiConfigValidationError("authType must be either none or jwt.");
  }

  return value as ApiConfigAuthType;
}

export function parseApiConfigInput(payload: unknown): ApiConfigInput {
  const data = readObject(payload, "payload");

  return {
    name: parseName(data.name, true) as string,
    baseUrl: parseBaseUrl(data.baseUrl, true) as string,
    defaultHeaders: parseHeaders(data.defaultHeaders, true) as ApiConfigHeaders,
    authType: parseAuthType(data.authType, true) as ApiConfigAuthType,
  };
}

export function parseApiConfigPatchInput(payload: unknown): ApiConfigPatchInput {
  const data = readObject(payload, "payload");

  const patch: ApiConfigPatchInput = {
    name: parseName(data.name, false),
    baseUrl: parseBaseUrl(data.baseUrl, false),
    defaultHeaders: parseHeaders(data.defaultHeaders, false),
    authType: parseAuthType(data.authType, false),
  };

  const hasUpdates = Object.values(patch).some((value) => value !== undefined);

  if (!hasUpdates) {
    throw new ApiConfigValidationError(
      "At least one updatable field is required."
    );
  }

  return patch;
}
