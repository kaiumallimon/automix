import { NextResponse } from "next/server";

import {
  createScenario,
  listScenarios,
} from "@/lib/scenario/service";
import { ScenarioValidationError } from "@/lib/scenario/schema";
import {
  requireSessionPayload,
  UnauthorizedSessionError,
} from "@/lib/auth/session-server";

function toErrorResponse(error: unknown): Response {
  if (error instanceof UnauthorizedSessionError) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (error instanceof ScenarioValidationError || error instanceof SyntaxError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(
    { error: "Failed to process scenario request." },
    { status: 500 }
  );
}

export async function GET(): Promise<Response> {
  try {
    const session = await requireSessionPayload();
    const scenarios = await listScenarios(session.sub);

    return NextResponse.json({ data: scenarios });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const session = await requireSessionPayload();
    const payload = (await request.json()) as unknown;
    const created = await createScenario(session.sub, payload);

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
