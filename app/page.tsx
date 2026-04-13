import Link from "next/link";

export default function Home() {
  const setupChecklist = [
    "Next.js App Router + TypeScript baseline",
    "Tailwind CSS v4 + shadcn/ui initialization",
    "Firebase client bootstrap layer",
    "Clean architecture folder boundaries",
  ];

  return (
    <main className="flex flex-1 items-center justify-center bg-[radial-gradient(circle_at_top,#f5f5f4,transparent_55%),linear-gradient(to_bottom,#fafaf9,#f5f5f4)] px-6 py-12">
      <section className="w-full max-w-3xl rounded-2xl border border-border bg-card p-8 shadow-sm sm:p-10">
        <p className="text-sm font-medium text-muted-foreground">
          Step 1 Complete
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-card-foreground sm:text-4xl">
          Automix setup is ready
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
          The project is now prepared for feature-by-feature delivery with a
          clean architecture and Firebase integration foundation.
        </p>

        <ul className="mt-8 space-y-3">
          {setupChecklist.map((item) => (
            <li
              key={item}
              className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-foreground"
            >
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/api-configs"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            Open API Configs
          </Link>
          <Link
            href="/scenarios"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            Open Scenarios
          </Link>
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            Register
          </Link>
        </div>
      </section>
    </main>
  );
}
