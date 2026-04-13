const quickStartFlow = [
  "Create an API Config with base URL and default headers.",
  "Create a Scenario and choose that API Config.",
  "Open Step Editor and add steps in execution order.",
  "Use captures from earlier responses and reference them in later steps.",
  "Run the scenario and inspect details in Runs.",
];

const coreConcepts = [
  {
    title: "API Config",
    detail:
      "Shared connection profile for one API domain. Includes base URL, auth type, and default headers.",
  },
  {
    title: "Scenario",
    detail:
      "A full feature workflow test, built from ordered API steps.",
  },
  {
    title: "Step",
    detail:
      "A single HTTP request with assertions: expected status and expected response JSON.",
  },
  {
    title: "Run",
    detail:
      "One execution result of a scenario, with per-step request/response snapshots.",
  },
];

const commonErrors = [
  {
    title: "Invalid JSON in headers/body",
    detail:
      "Use valid JSON with quoted keys, for example: {\"Content-Type\":\"application/json\"}.",
  },
  {
    title: "Unresolved variables",
    detail:
      "If a step uses {{token}}, that variable must be captured by an earlier step.",
  },
  {
    title: "Trailing slash mismatch",
    detail:
      "Keep base URL stable and avoid accidental double slashes in endpoints.",
  },
];

const exampleCapture = `{
  "token": "data.token",
  "userId": "data.user.id"
}`;

const exampleHeaders = `{
  "Authorization": "Bearer {{token}}",
  "Content-Type": "application/json"
}`;

export default function HelpPage() {
  return (
    <main className="flex w-full flex-1 flex-col gap-8">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">Help Center</p>
        <h1 className="text-3xl font-semibold tracking-[-0.02em] text-foreground">
          Understand Automix End-to-End
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
          This page explains how to use API Configs, Scenarios, Steps, and Runs with a
          practical, feature-style API testing flow.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-card-foreground">Core Concepts</h2>
          <div className="mt-4 space-y-3">
            {coreConcepts.map((item) => (
              <div key={item.title} className="border border-border bg-muted/40 p-4">
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-card-foreground">Quick Start Flow</h2>
          <ol className="mt-4 space-y-3">
            {quickStartFlow.map((step, index) => (
              <li key={step} className="border border-border bg-muted/40 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Step {index + 1}
                </p>
                <p className="mt-1 text-sm text-foreground">{step}</p>
              </li>
            ))}
          </ol>
        </article>
      </section>

      <section className="border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground">Example Scenario (Feature Test)</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Scenario: &quot;Authenticated profile management&quot;
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <article className="border border-border bg-muted/40 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Step 1</p>
            <p className="mt-1 text-sm font-semibold text-foreground">POST /auth/login</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Expect status 200 and capture values:
            </p>
            <pre className="mt-2 overflow-x-auto border border-border bg-background p-3 text-[11px] text-foreground">
              {exampleCapture}
            </pre>
          </article>

          <article className="border border-border bg-muted/40 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Step 2</p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {"GET /users/{{userId}}"}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Reuse captured token and id in headers/endpoint:
            </p>
            <pre className="mt-2 overflow-x-auto border border-border bg-background p-3 text-[11px] text-foreground">
              {exampleHeaders}
            </pre>
          </article>

          <article className="border border-border bg-muted/40 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Step 3</p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {"PATCH /users/{{userId}}"}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Assert expected response fields after update.
            </p>
          </article>

          <article className="border border-border bg-muted/40 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Run + Inspect</p>
            <p className="mt-1 text-sm font-semibold text-foreground">Open Runs dashboard</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Review each step snapshots, actual status, and captured variables.
            </p>
          </article>
        </div>
      </section>

      <section className="border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground">Common Issues</h2>
        <div className="mt-4 space-y-3">
          {commonErrors.map((item) => (
            <div key={item.title} className="border border-border bg-muted/40 p-4">
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
