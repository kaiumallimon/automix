import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FlaskConical,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { JetBrains_Mono } from "next/font/google";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
});

const trustStats = [
  { value: "3x", label: "Faster scenario regression loops" },
  { value: "100%", label: "Step-level request and response traceability" },
  { value: "1 place", label: "Config, run history, and diagnostics" },
];

const featureCards: Array<{
  title: string;
  summary: string;
  icon: LucideIcon;
  points: string[];
}> = [
  {
    title: "Scenario workflows",
    summary:
      "Design end-to-end API journeys with reusable variables and strict status assertions.",
    icon: Workflow,
    points: ["Step sequencing", "Variable capture", "Metadata-based organization"],
  },
  {
    title: "Real run intelligence",
    summary:
      "Inspect each run with endpoint, payload, and response snapshots without jumping tools.",
    icon: Activity,
    points: ["Run timeline", "Per-step diagnostics", "Failure context on one screen"],
  },
  {
    title: "Safer release confidence",
    summary:
      "Catch behavior drift before production by replaying stable scenarios on every change.",
    icon: ShieldCheck,
    points: ["Predictable checks", "Consistent team quality", "Lower incident risk"],
  },
];

const launchSequence = [
  {
    title: "Configure your API base",
    description:
      "Set default headers, auth mode, and environment base URL in one reusable config.",
  },
  {
    title: "Build realistic scenarios",
    description:
      "Model how users move through your backend, not just isolated endpoints.",
  },
  {
    title: "Run and learn quickly",
    description:
      "Get a readable run history and step-level evidence to ship with confidence.",
  },
];

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col overflow-x-hidden bg-[#f3f5fb] text-[#0f1728]">

      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_10%,rgba(0,113,227,0.2),transparent_36%),radial-gradient(circle_at_90%_12%,rgba(6,182,212,0.16),transparent_32%),radial-gradient(circle_at_50%_90%,rgba(15,23,40,0.08),transparent_40%)]" />

      {/* HEADER */}
      <header className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 border-b border-black/10 bg-white/70 px-4 py-3 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
        <div>
          <p className={`${mono.className} text-xs uppercase tracking-[0.2em] text-black/60`}>
            Automix Platform
          </p>
          <p className="text-sm font-semibold text-black">
            API confidence, shipped faster
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/login"
            className="inline-flex h-9 items-center justify-center border border-black/15 bg-white px-3 text-sm font-medium text-black transition hover:bg-black hover:text-white"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="inline-flex h-9 items-center justify-center bg-[#0071e3] px-3 text-sm font-medium text-white transition hover:bg-[#005bb5]"
          >
            Create workspace
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="px-6 pb-16 pt-10 sm:pt-14 lg:pb-24">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]">

            <div>
              <p className={`${mono.className} inline-flex items-center gap-2 border border-black/15 bg-white px-3 py-1 text-xs uppercase tracking-[0.18em] text-black/70`}>
                <Sparkles className="size-3.5 text-[#0071e3]" />
                Modern API test orchestration
              </p>

              <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.025em] sm:text-5xl lg:text-6xl">
                Turn API testing into a growth engine, not a release bottleneck.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-black/70 sm:text-lg">
                Automix helps teams design scenario-based tests, execute them with complete
                traceability, and catch regressions before customers ever feel them.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="inline-flex h-11 items-center justify-center gap-2 bg-[#0071e3] px-5 text-sm font-semibold text-white transition-all hover:bg-[#005bb5] hover:shadow-[0_10px_25px_-10px_rgba(0,113,227,0.8)] active:scale-[0.98]"
                >
                  Start building scenarios
                  <ArrowRight className="size-4" />
                </Link>

                <Link
                  href="/help"
                  className="inline-flex h-11 items-center justify-center border border-black/15 bg-white px-5 text-sm font-semibold text-black transition-all hover:bg-black hover:text-white active:scale-[0.98]"
                >
                  Explore product guide
                </Link>
              </div>
            </div>

            {/* LIVE PREVIEW */}
            <aside className="border border-black/10 bg-white/90 p-5 backdrop-blur-sm shadow-[0_40px_100px_-60px_rgba(0,113,227,0.6)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Live Run Preview</p>
                  <p className={`${mono.className} text-xs uppercase tracking-[0.16em] text-black/55`}>
                    Scenario: checkout-hardening
                  </p>
                </div>

                <span className="inline-flex items-center border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                  PASSING
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  { label: "POST /auth/login", ms: "96ms" },
                  { label: "GET /cart/current", ms: "121ms" },
                  { label: "PATCH /cart/items", ms: "143ms" },
                  { label: "POST /checkout/confirm", ms: "204ms" },
                ].map((step, i) => (
                  <div
                    key={step.label}
                    className="flex items-center justify-between border border-black/10 bg-[#f8f9fc] px-3 py-2"
                  >
                    <p className={`${mono.className} text-xs`}>{step.label}</p>
                    <span className="text-xs text-black/60">{step.ms}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-6 pb-20">
        <div className="mx-auto w-full max-w-6xl">
          <div className="grid gap-4 lg:grid-cols-3">
            {featureCards.map((card) => {
              const Icon = card.icon;

              return (
                <article
                  key={card.title}
                  className="border border-black/10 bg-white/90 p-5 backdrop-blur-sm shadow-[0_10px_30px_-20px_rgba(0,0,0,0.25)] transition hover:-translate-y-1"
                >
                  <Icon className="size-4 text-[#0071e3]" />

                  <h3 className="mt-4 text-lg font-semibold">{card.title}</h3>
                  <p className="mt-2 text-sm text-black/70">{card.summary}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-y border-black/10 bg-[#0a1120] px-6 py-20 text-white">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-semibold sm:text-4xl">
            From API config to release confidence in minutes.
          </h2>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex h-11 items-center bg-[#0071e3] px-5 text-sm font-semibold hover:bg-[#005bb5]"
            >
              Get started
            </Link>

            <Link
              href="/runs"
              className="inline-flex h-11 items-center border border-white/20 bg-white/10 px-5 text-sm"
            >
              View runs
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-black/10 bg-white/70 px-6 py-8 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className={`${mono.className} text-xs text-black/60`}>
            Automix © {new Date().getFullYear()}
          </p>

          <div className="flex gap-4 text-sm text-black/70">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/scenarios">Scenarios</Link>
            <Link href="/runs">Runs</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}