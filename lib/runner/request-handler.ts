import "server-only";

interface HttpRequestOptions {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string | null;
}

export interface HttpExecutionResult {
  status: number;
  headers: Record<string, string>;
  body: unknown;
  rawBody: string;
}

function toHeaderObject(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of headers.entries()) {
    result[key] = value;
  }

  return result;
}

function parseResponseBody(rawBody: string): unknown {
  if (rawBody.length === 0) {
    return null;
  }

  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    return rawBody;
  }
}

export async function executeHttpRequest(
  options: HttpRequestOptions
): Promise<HttpExecutionResult> {
  const response = await fetch(options.url, {
    method: options.method,
    headers: options.headers,
    body: options.body,
    cache: "no-store",
  });

  const rawBody = await response.text();

  return {
    status: response.status,
    headers: toHeaderObject(response.headers),
    body: parseResponseBody(rawBody),
    rawBody,
  };
}
