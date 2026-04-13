import { NextResponse } from "next/server";

import {
  requireSessionPayload,
  UnauthorizedSessionError,
} from "@/lib/auth/session-server";
import { listRuns } from "@/lib/runs/service";

function toErrorResponse(error: unknown): Response {
  if (error instanceof UnauthorizedSessionError) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.json({ error: "Failed to load runs." }, { status: 500 });
}

export async function GET(request: Request): Promise<Response> {
  try {
    const session = await requireSessionPayload();
    const searchParams = new URL(request.url).searchParams;
    const scenarioId = searchParams.get("scenarioId") ?? undefined;

    const runs = await listRuns(session.sub, scenarioId);

    return NextResponse.json({ data: runs });
  } catch (error) {
    return toErrorResponse(error);
  }
}
