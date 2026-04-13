import Link from "next/link";

export default function Home() {
  const setupChecklist = [
    "Next.js App Router + TypeScript baseline",
    "Tailwind CSS v4 + shadcn/ui initialization",
    "Firebase client bootstrap layer",
    "Clean architecture folder boundaries",
  ];

  return (
    <main className="flex flex-1 flex-col bg-[#f5f5f7]">
      <section className="border-b border-white/20 bg-black px-6 py-14 sm:py-20">
        <div className="mx-auto w-full max-w-5xl">
          <p className="text-xs uppercase tracking-[0.2em] text-white/70">Automix Platform</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-[1.08] tracking-[-0.02em] text-white sm:text-5xl">
            Scenario-driven API testing with cleaner runs, faster iteration, and
            precise visibility.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
            Build test flows, execute sequential API scenarios, and inspect step-by-step
            evidence from one square, production-focused workspace.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/api-configs"
              className="inline-flex h-10 items-center justify-center border border-white bg-white px-4 text-sm font-medium text-black transition hover:bg-white/90"
            >
              Open API Configs
            </Link>
            <Link
              href="/scenarios"
              className="inline-flex h-10 items-center justify-center border border-white/40 px-4 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Open Scenarios
            </Link>
            <Link
              href="/runs"
              className="inline-flex h-10 items-center justify-center border border-white/40 px-4 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Open Runs
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-10 sm:py-14">
        <div className="mx-auto w-full max-w-5xl border border-border bg-card p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Foundation</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.015em] text-card-foreground sm:text-3xl">
            Setup is complete
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {setupChecklist.map((item) => (
              <li
                key={item}
                className="border border-border bg-muted/50 px-4 py-3 text-sm text-foreground"
              >
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex h-10 items-center justify-center border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Register
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
