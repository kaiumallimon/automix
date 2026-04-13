import { NextResponse } from "next/server";

import {
  getApiConfigById,
  ApiConfigNotFoundError,
} from "@/lib/api-config/service";
import {
  requireSessionPayload,
  UnauthorizedSessionError,
} from "@/lib/auth/session-server";
import { runFuzzScenarioBatch, runScenarioCore } from "@/lib/runner";
import {
  getScenarioById,
  ScenarioNotFoundError,
} from "@/lib/scenario/service";
import { logScenarioRun } from "@/lib/runs/service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface RunRequestBody {
  fuzz?: unknown;
  maxVariants?: unknown;
}

function parseRunOptions(body: RunRequestBody): {
  fuzz: boolean;
  maxVariants: number;
} {
  const fuzz = body.fuzz === true;
  const rawMaxVariants =
    typeof body.maxVariants === "number" && Number.isInteger(body.maxVariants)
      ? body.maxVariants
      : 4;

  const maxVariants = Math.min(20, Math.max(1, rawMaxVariants));

  return {
    fuzz,
    maxVariants,
  };
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
  request: Request,
  context: RouteContext
): Promise<Response> {
  try {
    const session = await requireSessionPayload();
    const { id } = await context.params;

    let requestBody: RunRequestBody = {};

    try {
      requestBody = (await request.json()) as RunRequestBody;
    } catch {
      requestBody = {};
    }

    const runOptions = parseRunOptions(requestBody);

    const scenario = await getScenarioById(session.sub, id);
    const apiConfig = await getApiConfigById(session.sub, scenario.apiConfigId);

    if (runOptions.fuzz) {
      const fuzzResults = await runFuzzScenarioBatch({
        scenario,
        apiConfig,
        maxVariants: runOptions.maxVariants,
      });

      const persistedRuns = [];

      for (const fuzzResult of fuzzResults) {
        const run = await logScenarioRun(session.sub, apiConfig.id, fuzzResult.result);

        persistedRuns.push({
          label: fuzzResult.label,
          run,
          summary: fuzzResult.result,
        });
      }

      return NextResponse.json({
        data: {
          mode: "fuzz",
          runs: persistedRuns,
        },
      });
    }

    const runResult = await runScenarioCore({
      scenario,
      apiConfig,
    });

    const persistedRun = await logScenarioRun(session.sub, apiConfig.id, runResult);

    return NextResponse.json({
      data: {
        mode: "single",
        run: persistedRun,
        summary: runResult,
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
