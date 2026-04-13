import { NextResponse } from "next/server";

import {
  requireSessionPayload,
  UnauthorizedSessionError,
} from "@/lib/auth/session-server";
import { getRunWithSteps, RunNotFoundError } from "@/lib/runs/service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function toErrorResponse(error: unknown): Response {
  if (error instanceof UnauthorizedSessionError) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (error instanceof RunNotFoundError) {
    return NextResponse.json({ error: "Run not found." }, { status: 404 });
  }

  return NextResponse.json(
    { error: "Failed to load run details." },
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

    const run = await getRunWithSteps(session.sub, id);

    return NextResponse.json({ data: run });
  } catch (error) {
    return toErrorResponse(error);
  }
}
