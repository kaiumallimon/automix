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

import { Logo } from "@/components/layout/logo";

const trustStats = [
  { value: "3x", label: "Faster scenario regression loops" },
  { value: "99.9%", label: "Consistent signal in every replayed run" },
  { value: "1 view", label: "Timeline, payload, and diagnosis together" },
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
      "Model realistic user flows with reusable captures, strict assertions, and clear ownership.",
    icon: Workflow,
    points: ["Step sequencing", "Variable capture", "Metadata organization"],
  },
  {
    title: "Real run intelligence",
    summary:
      "Inspect every run with endpoint, payload, and response snapshots without context switching.",
    icon: Activity,
    points: ["Run timeline", "Per-step diagnostics", "Failure context in one place"],
  },
  {
    title: "Safer release confidence",
    summary:
      "Catch behavior drift before production by replaying stable scenarios against each release.",
    icon: ShieldCheck,
    points: ["Predictable checks", "Consistent team quality", "Lower incident risk"],
  },
];

const launchSequence: Array<{
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    title: "Configure your API base",
    description:
      "Set default headers, auth mode, and environment base URL in one reusable config.",
    icon: FlaskConical,
  },
  {
    title: "Build realistic scenarios",
    description:
      "Model how users move through your backend, not just isolated endpoints.",
    icon: Workflow,
  },
  {
    title: "Run and learn quickly",
    description:
      "Get a readable run history and step-level evidence to ship with confidence.",
    icon: Clock3,
  },
];

const liveRunSteps = [
  {
    label: "POST /auth/login",
    assertion: "Assert status 200, capture token",
    ms: "96ms",
  },
  {
    label: "GET /cart/current",
    assertion: "Assert status 200, capture cartId",
    ms: "121ms",
  },
  {
    label: "PATCH /cart/items",
    assertion: "Assert item count and totals",
    ms: "143ms",
  },
  {
    label: "POST /checkout/confirm",
    assertion: "Assert status 201 and order state",
    ms: "204ms",
  },
];

const guardrails = [
  "Scenario-aware assertions for every critical endpoint",
  "Response captures that feed later requests automatically",
  "Readable evidence for engineers, QA, and product owners",
  "Replay-ready checks for release validation pipelines",
];

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col overflow-x-clip bg-[#f3f5fb] text-[#0f1728]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_8%_8%,rgba(0,113,227,0.22),transparent_34%),radial-gradient(circle_at_92%_12%,rgba(6,182,212,0.14),transparent_34%),radial-gradient(circle_at_50%_94%,rgba(15,23,40,0.08),transparent_42%)]"
      />

      <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 border border-black/10 bg-white/70 px-4 py-3 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-white/60">
          <Logo size="sm" descriptor="Platform" />

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/api-configs"
              className="hidden h-9 items-center justify-center border border-black/10 bg-white px-3 text-xs font-medium text-black/75 transition hover:bg-black hover:text-white sm:inline-flex"
            >
              Product tour
            </Link>

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
        </div>
      </header>

      <section className="px-4 pb-14 pt-10 sm:px-6 sm:pt-14 lg:pb-20">
        <div className="mx-auto w-full max-w-6xl">
          <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="inline-flex items-center gap-2 border border-black/15 bg-white px-3 py-1 font-[var(--font-apple-mono)] text-xs uppercase tracking-[0.18em] text-black/70">
                <Sparkles className="size-3.5 text-[#0071e3]" />
                Release-grade API orchestration
              </p>

              <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.04] tracking-[-0.03em] sm:text-5xl lg:text-[4.05rem]">
                Turn API testing into a product advantage, not a shipping bottleneck.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-black/70 sm:text-lg">
                Automix helps teams design scenario-based checks, replay them quickly,
                and ship every backend change with traceable evidence.
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
                  href="/login"
                  className="inline-flex h-11 items-center justify-center border border-black/15 bg-white px-5 text-sm font-semibold text-black transition-all hover:bg-black hover:text-white active:scale-[0.98]"
                >
                  Open workspace
                </Link>
              </div>

              <div className="mt-8 grid gap-2 sm:grid-cols-2">
                {guardrails.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2 border border-black/10 bg-white/85 px-3 py-2"
                  >
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-[#0071e3]" />
                    <p className="text-xs leading-5 text-black/72">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="border border-black/10 bg-white/90 p-5 shadow-[0_50px_110px_-75px_rgba(0,113,227,0.9)] backdrop-blur-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Live Run Preview</p>
                  <p className="mt-1 font-[var(--font-apple-mono)] text-xs uppercase tracking-[0.16em] text-black/55">
                    Scenario: checkout-hardening
                  </p>
                </div>

                <span className="inline-flex items-center border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                  Passing
                </span>
              </div>

              <div className="mt-5 space-y-2.5">
                {liveRunSteps.map((step) => (
                  <div
                    key={step.label}
                    className="flex items-center justify-between gap-2 border border-black/10 bg-[#f8f9fc] px-3 py-2.5"
                  >
                    <div>
                      <p className="font-[var(--font-apple-mono)] text-[11px]">{step.label}</p>
                      <p className="mt-1 text-[11px] text-black/55">{step.assertion}</p>
                    </div>
                    <span className="shrink-0 text-xs text-black/60">{step.ms}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-3 border border-black/10 bg-[#f8f9fc] p-3 sm:grid-cols-2">
                <div className="border border-black/10 bg-white px-3 py-2">
                  <p className="font-[var(--font-apple-mono)] text-[10px] uppercase tracking-[0.14em] text-black/55">
                    Mean latency
                  </p>
                  <p className="mt-1 text-lg font-semibold">141ms</p>
                </div>
                <div className="border border-black/10 bg-white px-3 py-2">
                  <p className="font-[var(--font-apple-mono)] text-[10px] uppercase tracking-[0.14em] text-black/55">
                    Signal score
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-lg font-semibold">
                    <Activity className="size-4 text-[#0071e3]" />
                    98.7%
                  </p>
                </div>
              </div>
            </aside>
          </div>

          <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-3">
            {trustStats.map((item) => (
              <article key={item.label} className="border border-black/10 bg-white/88 px-4 py-4">
                <p className="text-2xl font-semibold tracking-[-0.02em] text-[#0071e3]">
                  {item.value}
                </p>
                <p className="mt-2 text-sm text-black/68">{item.label}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-[var(--font-apple-mono)] text-xs uppercase tracking-[0.18em] text-black/55">
                Product capabilities
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.022em] sm:text-4xl">
                Built for detail-oriented release teams
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-black/64 sm:text-base">
              Keep configuration, execution, and diagnosis in one environment so every
              sprint ends with evidence-backed confidence.
            </p>
          </div>

          <div className="mt-7 grid gap-4 lg:grid-cols-3">
            {featureCards.map((card) => {
              const Icon = card.icon;

              return (
                <article
                  key={card.title}
                  className="border border-black/10 bg-white/90 p-5 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.22)] transition hover:-translate-y-1"
                >
                  <Icon className="size-4 text-[#0071e3]" />

                  <h3 className="mt-4 text-lg font-semibold">{card.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-black/70">{card.summary}</p>

                  <ul className="mt-4 space-y-2">
                    {card.points.map((point) => (
                      <li key={point} className="flex items-center gap-2 text-sm text-black/68">
                        <CheckCircle2 className="size-3.5 text-[#0071e3]" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto grid w-full max-w-6xl gap-4 lg:grid-cols-[1.04fr_0.96fr]">
          <article className="border border-black/10 bg-white/92 p-6">
            <p className="font-[var(--font-apple-mono)] text-xs uppercase tracking-[0.18em] text-black/55">
              Launch sequence
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
              From first config to repeatable release confidence
            </h2>

            <div className="mt-6 space-y-3">
              {launchSequence.map((item, index) => {
                const StepIcon = item.icon;

                return (
                  <div key={item.title} className="border border-black/10 bg-[#f8f9fc] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-[var(--font-apple-mono)] text-[10px] uppercase tracking-[0.16em] text-black/55">
                        Step {index + 1}
                      </p>
                      <StepIcon className="size-4 text-[#0071e3]" />
                    </div>
                    <p className="mt-2 text-sm font-semibold text-black">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-black/66">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="border border-black/10 bg-[#0d1425] p-6 text-white">
            <p className="font-[var(--font-apple-mono)] text-xs uppercase tracking-[0.18em] text-white/65">
              Run insight snapshot
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.02em]">
              checkout-hardening • execution 42
            </h3>
            <p className="mt-3 text-sm leading-7 text-white/75">
              Automix pinpoints where a release could fail, why it failed, and what changed
              from the last passing baseline.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="border border-white/20 bg-white/8 px-3 py-3">
                <p className="font-[var(--font-apple-mono)] text-[10px] uppercase tracking-[0.16em] text-white/65">
                  Assertion pass rate
                </p>
                <p className="mt-2 text-xl font-semibold text-white">97.4%</p>
              </div>
              <div className="border border-white/20 bg-white/8 px-3 py-3">
                <p className="font-[var(--font-apple-mono)] text-[10px] uppercase tracking-[0.16em] text-white/65">
                  Critical drift alerts
                </p>
                <p className="mt-2 flex items-center gap-1 text-xl font-semibold text-white">
                  <ShieldCheck className="size-4 text-[#7cc3ff]" />
                  0
                </p>
              </div>
            </div>

            <ul className="mt-5 space-y-2 text-sm text-white/80">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-[#7cc3ff]" />
                Regression in payment status mapping prevented.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-[#7cc3ff]" />
                Header auth fallback issue surfaced before staging handoff.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-[#7cc3ff]" />
                Run artifact export ready for QA release note traceability.
              </li>
            </ul>
          </article>
        </div>
      </section>

      <section className="border-y border-black/10 bg-[#0a1120] px-4 py-18 text-white sm:px-6 sm:py-20">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Logo tone="dark" size="md" descriptor="Release Intelligence" />
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              Move from API changes to safe releases with clarity in every run.
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center bg-[#0071e3] px-5 text-sm font-semibold text-white transition hover:bg-[#005bb5]"
            >
              Start free workspace
            </Link>
            <Link
              href="/runs"
              className="inline-flex h-11 items-center justify-center border border-white/20 bg-white/10 px-5 text-sm font-medium text-white transition hover:bg-white/18"
            >
              View run dashboard
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-black/10 bg-white/76 px-4 py-8 backdrop-blur sm:px-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <p className="text-xs text-black/58">© {new Date().getFullYear()} Automix</p>
          </div>

          <div className="flex gap-4 text-sm text-black/70">
            <Link href="/api-configs">API Configs</Link>
            <Link href="/scenarios">Scenarios</Link>
            <Link href="/runs">Runs</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}