import { NextResponse } from "next/server";

import {
  createApiConfig,
  listApiConfigs,
} from "@/lib/api-config/service";
import { ApiConfigValidationError } from "@/lib/api-config/schema";
import {
  requireSessionPayload,
  UnauthorizedSessionError,
} from "@/lib/auth/session-server";

function toErrorResponse(error: unknown): Response {
  if (error instanceof UnauthorizedSessionError) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (error instanceof ApiConfigValidationError || error instanceof SyntaxError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (
    error instanceof Error &&
    (error.message.toLowerCase().includes("insufficient permissions") ||
      error.message.toLowerCase().includes("permission-denied") ||
      error.message.toLowerCase().includes("default credentials") ||
      error.message.toLowerCase().includes("private key") ||
      error.message.toLowerCase().includes("project id"))
  ) {
    return NextResponse.json(
      {
        error:
          "Server Firestore credentials are missing or invalid. Configure Firebase Admin environment variables.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { error: "Failed to process API config request." },
    { status: 500 }
  );
}

export async function GET(): Promise<Response> {
  try {
    const session = await requireSessionPayload();
    const configs = await listApiConfigs(session.sub);

    return NextResponse.json({ data: configs });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const session = await requireSessionPayload();
    const payload = (await request.json()) as unknown;
    const created = await createApiConfig(session.sub, payload);

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
