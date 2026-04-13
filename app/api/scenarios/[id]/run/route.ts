import { NextResponse } from "next/server";

import {
  getApiConfigById,
  ApiConfigNotFoundError,
} from "@/lib/api-config/service";
import {
  requireSessionPayload,
  UnauthorizedSessionError,
} from "@/lib/auth/session-server";
import { runScenarioCore } from "@/lib/runner";
import {
  getScenarioById,
  ScenarioNotFoundError,
} from "@/lib/scenario/service";
import { logScenarioRun } from "@/lib/runs/service";

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

  if (error instanceof ApiConfigNotFoundError) {
    return NextResponse.json({ error: "API config not found." }, { status: 404 });
  }

  return NextResponse.json(
    { error: "Failed to execute scenario run." },
    { status: 500 }
  );
}

export async function POST(
  _request: Request,
  context: RouteContext
): Promise<Response> {
  try {
    const session = await requireSessionPayload();
    const { id } = await context.params;

    const scenario = await getScenarioById(session.sub, id);
    const apiConfig = await getApiConfigById(session.sub, scenario.apiConfigId);

    const runResult = await runScenarioCore({
      scenario,
      apiConfig,
    });

    const persistedRun = await logScenarioRun(session.sub, apiConfig.id, runResult);

    return NextResponse.json({
      data: {
        run: persistedRun,
        summary: runResult,
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
