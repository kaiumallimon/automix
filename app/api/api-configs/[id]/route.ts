import { NextResponse } from "next/server";

import {
  deleteApiConfig,
  getApiConfigById,
  updateApiConfig,
  ApiConfigNotFoundError,
} from "@/lib/api-config/service";
import { ApiConfigValidationError } from "@/lib/api-config/schema";
import {
  requireSessionPayload,
  UnauthorizedSessionError,
} from "@/lib/auth/session-server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function toErrorResponse(error: unknown): Response {
  if (error instanceof UnauthorizedSessionError) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (error instanceof ApiConfigNotFoundError) {
    return NextResponse.json({ error: "API config not found." }, { status: 404 });
  }

  if (error instanceof ApiConfigValidationError || error instanceof SyntaxError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(
    { error: "Failed to process API config request." },
    { status: 500 }
  );
}

export async function GET(
  _request: Request,
  context: RouteContext
): Promise<Response> {
  try {
    const session = await requireSessionPayload();
    const { id } = await context.params;
    const config = await getApiConfigById(session.sub, id);

    return NextResponse.json({ data: config });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext
): Promise<Response> {
  try {
    const session = await requireSessionPayload();
    const { id } = await context.params;
    const patch = (await request.json()) as unknown;
    const updated = await updateApiConfig(session.sub, id, patch);

    return NextResponse.json({ data: updated });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext
): Promise<Response> {
  try {
    const session = await requireSessionPayload();
    const { id } = await context.params;

    await deleteApiConfig(session.sub, id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
