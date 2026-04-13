import "server-only";

import { SignJWT, jwtVerify, type JWTPayload } from "jose";

import { AUTH_SESSION_DURATION_SECONDS } from "./constants";

export interface AuthSessionPayload extends JWTPayload {
  sub: string;
  email: string | null;
}

function getSessionSigningKey(): Uint8Array {
  const secret = process.env.AUTH_SESSION_SECRET;

  if (!secret) {
    throw new Error(
      "Missing AUTH_SESSION_SECRET. Add it to your deployment environment and .env.local."
    );
  }

  return new TextEncoder().encode(secret);
}

export async function createAuthSessionToken(
  payload: Pick<AuthSessionPayload, "sub" | "email">
): Promise<string> {
  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${AUTH_SESSION_DURATION_SECONDS}s`)
    .sign(getSessionSigningKey());
}

export async function verifyAuthSessionToken(
  token: string
): Promise<AuthSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSessionSigningKey());

    if (typeof payload.sub !== "string") {
      return null;
    }

    const email = typeof payload.email === "string" ? payload.email : null;

    return {
      ...payload,
      sub: payload.sub,
      email,
    };
  } catch {
    return null;
  }
}
