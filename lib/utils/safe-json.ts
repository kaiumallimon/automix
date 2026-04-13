export type JsonPrimitive = boolean | number | string | null;
export type JsonArray = JsonValue[];
export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

export interface JsonObject {
  [key: string]: JsonValue;
}

export function parseJsonObject(input: string): JsonObject {
  const parsed: unknown = JSON.parse(input);

  if (!isJsonObject(parsed)) {
    throw new Error("Expected a JSON object value.");
  }

  return parsed;
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
