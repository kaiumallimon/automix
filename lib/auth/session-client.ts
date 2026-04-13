"use client";

interface SessionRequestBody {
  idToken: string;
}

export async function syncSessionCookie(idToken: string | null): Promise<void> {
  const requestBody: SessionRequestBody | undefined = idToken
    ? { idToken }
    : undefined;

  const response = await fetch("/api/auth/session", {
    method: idToken ? "POST" : "DELETE",
    headers: idToken ? { "Content-Type": "application/json" } : undefined,
    body: requestBody ? JSON.stringify(requestBody) : undefined,
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    let reason = "Unknown error.";

    try {
      const payload = (await response.json()) as { error?: unknown };
      if (typeof payload.error === "string") {
        reason = payload.error;
      }
    } catch {
      reason = "Response body was not JSON.";
    }

    throw new Error(
      `Session sync failed with status ${response.status}: ${reason}`
    );
  }
}
