import { NextResponse } from "next/server";

import {
  deleteScenario,
  getScenarioById,
  ScenarioNotFoundError,
  updateScenario,
} from "@/lib/scenario/service";
import { ScenarioValidationError } from "@/lib/scenario/schema";
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

  if (error instanceof ScenarioNotFoundError) {
    return NextResponse.json({ error: "Scenario not found." }, { status: 404 });
  }

  if (error instanceof ScenarioValidationError || error instanceof SyntaxError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(
    { error: "Failed to process scenario request." },
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
    const scenario = await getScenarioById(session.sub, id);

    return NextResponse.json({ data: scenario });
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
    const updated = await updateScenario(session.sub, id, patch);

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

    await deleteScenario(session.sub, id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
