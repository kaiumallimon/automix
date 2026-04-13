import "server-only";

import { cookies } from "next/headers";

import { AUTH_SESSION_COOKIE_NAME } from "./constants";
import {
  verifyAuthSessionToken,
  type AuthSessionPayload,
} from "./session";

export class UnauthorizedSessionError extends Error {
  constructor() {
    super("Unauthorized session.");
  }
}

export async function getSessionPayload(): Promise<AuthSessionPayload | null> {
  const token = (await cookies()).get(AUTH_SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifyAuthSessionToken(token);
}

export async function requireSessionPayload(): Promise<AuthSessionPayload> {
  const payload = await getSessionPayload();

  if (!payload) {
    throw new UnauthorizedSessionError();
  }

  return payload;
}
