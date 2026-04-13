import { NextResponse } from "next/server";

import {
  AUTH_SESSION_COOKIE_NAME,
  AUTH_SESSION_DURATION_SECONDS,
} from "@/lib/auth/constants";
import { createAuthSessionToken } from "@/lib/auth/session";

interface FirebaseLookupResponse {
  users?: Array<{
    localId?: string;
    email?: string;
  }>;
}

interface SessionRequestBody {
  idToken?: unknown;
}

function getFirebaseApiKey(): string {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  if (!apiKey) {
    throw new Error("Missing NEXT_PUBLIC_FIREBASE_API_KEY environment variable.");
  }

  return apiKey;
}

function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === "production";
}

async function verifyFirebaseIdToken(idToken: string): Promise<{
  uid: string;
  email: string | null;
}> {
  const lookupResponse = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${getFirebaseApiKey()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
      cache: "no-store",
    }
  );

  if (!lookupResponse.ok) {
    throw new Error("Firebase ID token verification failed.");
  }

  const payload = (await lookupResponse.json()) as FirebaseLookupResponse;
  const account = payload.users?.[0];

  if (!account?.localId) {
    throw new Error("Firebase ID token payload did not include a valid user.");
  }

  return {
    uid: account.localId,
    email: typeof account.email === "string" ? account.email : null,
  };
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as SessionRequestBody;

    if (typeof body.idToken !== "string" || body.idToken.length === 0) {
      return NextResponse.json(
        { error: "Invalid session payload." },
        { status: 400 }
      );
    }

    const identity = await verifyFirebaseIdToken(body.idToken);
    const sessionToken = await createAuthSessionToken({
      sub: identity.uid,
      email: identity.email,
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(AUTH_SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProductionEnvironment(),
      path: "/",
      maxAge: AUTH_SESSION_DURATION_SECONDS,
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Session sync failed.";

    if (
      message.includes("AUTH_SESSION_SECRET") ||
      message.includes("NEXT_PUBLIC_FIREBASE_API_KEY")
    ) {
      return NextResponse.json(
        { error: "Auth session server configuration is missing." },
        { status: 500 }
      );
    }

    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
}

export async function DELETE(): Promise<Response> {
  const response = NextResponse.json({ ok: true });

  response.cookies.set(AUTH_SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isProductionEnvironment(),
    path: "/",
    maxAge: 0,
  });

  return response;
}
