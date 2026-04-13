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
import { IBM_Plex_Mono, Sora } from "next/font/google";



const mono = IBM_Plex_Mono({
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
    <main className={`relative flex flex-1 flex-col overflow-x-hidden bg-[#f3f5fb] text-[#0f1728]`}>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_10%,rgba(0,113,227,0.2),transparent_36%),radial-gradient(circle_at_90%_12%,rgba(6,182,212,0.16),transparent_32%),radial-gradient(circle_at_50%_90%,rgba(15,23,40,0.08),transparent_40%)]" />

      <section className="px-6 pb-16 pt-8 sm:pt-12 lg:pb-24">
        <div className="mx-auto w-full max-w-6xl">
          <header className="flex flex-wrap items-center justify-between gap-3 border border-black/10 bg-white/70 px-4 py-3 backdrop-blur">
            <div>
              <p className={`${mono.className} text-xs uppercase tracking-[0.2em] text-black/60`}>
                Automix Platform
              </p>
              <p className="text-sm font-semibold text-black">API confidence, shipped faster</p>
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

          <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
              <p className={`${mono.className} inline-flex items-center gap-2 border border-black/15 bg-white px-3 py-1 text-xs uppercase tracking-[0.18em] text-black/70`}>
                <Sparkles className="size-3.5 text-[#0071e3]" />
                Modern API test orchestration
              </p>
              <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.025em] text-[#0b1324] sm:text-5xl lg:text-6xl">
                Turn API testing into a growth engine, not a release bottleneck.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-black/72 sm:text-lg">
                Automix helps teams design scenario-based tests, execute them with complete
                traceability, and catch regressions before customers ever feel them.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="inline-flex h-11 items-center justify-center gap-2 bg-[#0071e3] px-5 text-sm font-semibold text-white transition hover:bg-[#005bb5]"
                >
                  Start building scenarios
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/help"
                  className="inline-flex h-11 items-center justify-center border border-black/15 bg-white px-5 text-sm font-semibold text-black transition hover:bg-black hover:text-white"
                >
                  Explore product guide
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  "Built for API-first product teams",
                  "Fast enough for day-to-day developer loops",
                  "Readable by QA, backend, and product",
                  "Designed for incremental rollout confidence",
                ].map((item) => (
                  <p
                    key={item}
                    className="flex items-start gap-2 border border-black/10 bg-white/80 px-3 py-2 text-sm text-black/80"
                  >
                    <CheckCircle2 className="mt-0.5 size-4 text-[#0071e3]" />
                    <span>{item}</span>
                  </p>
                ))}
              </div>
            </div>

            <aside className="border border-black/10 bg-white p-5 shadow-[0_30px_80px_-50px_rgba(0,113,227,0.55)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700 lg:mt-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#0b1324]">Live Run Preview</p>
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
                  { label: "POST /auth/login", ms: "96ms", ok: true },
                  { label: "GET /cart/current", ms: "121ms", ok: true },
                  { label: "PATCH /cart/items", ms: "143ms", ok: true },
                  { label: "POST /checkout/confirm", ms: "204ms", ok: true },
                ].map((step, index) => (
                  <div
                    key={step.label}
                    className="flex items-center justify-between border border-black/10 bg-[#f8f9fc] px-3 py-2 motion-safe:animate-in motion-safe:fade-in"
                    style={{ animationDelay: `${index * 90}ms` }}
                  >
                    <p className={`${mono.className} text-xs text-black/75`}>{step.label}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-black/60">{step.ms}</span>
                      <span className="inline-flex size-5 items-center justify-center border border-emerald-200 bg-emerald-50 text-emerald-700">
                        <CheckCircle2 className="size-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                <div className="border border-black/10 bg-[#f8f9fc] px-2.5 py-2">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-black/55">Step pass rate</p>
                  <p className="mt-1 text-sm font-semibold text-black">99.2%</p>
                </div>
                <div className="border border-black/10 bg-[#f8f9fc] px-2.5 py-2">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-black/55">P95 runtime</p>
                  <p className="mt-1 text-sm font-semibold text-black">0.9s</p>
                </div>
                <div className="border border-black/10 bg-[#f8f9fc] px-2.5 py-2">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-black/55">Failed assertions</p>
                  <p className="mt-1 text-sm font-semibold text-black">0</p>
                </div>
              </div>
            </aside>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {trustStats.map((stat) => (
              <div
                key={stat.label}
                className="border border-black/10 bg-white/80 px-4 py-4 backdrop-blur motion-safe:animate-in motion-safe:fade-in"
              >
                <p className="text-3xl font-semibold tracking-[-0.02em] text-[#0b1324]">{stat.value}</p>
                <p className="mt-1 text-sm text-black/65">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-16 sm:pb-20">
        <div className="mx-auto w-full max-w-6xl">
          <header className="max-w-3xl">
            <p className={`${mono.className} text-xs uppercase tracking-[0.18em] text-black/58`}>
              Why teams choose Automix
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-[#0b1324] sm:text-4xl">
              A focused platform for high-signal API release validation.
            </h2>
          </header>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {featureCards.map((card, index) => {
              const Icon = card.icon;

              return (
                <article
                  key={card.title}
                  className="border border-black/10 bg-white p-5 transition hover:-translate-y-1 hover:shadow-[0_20px_45px_-32px_rgba(15,23,42,0.55)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3"
                  style={{ animationDelay: `${index * 110}ms` }}
                >
                  <div className="inline-flex border border-black/10 bg-[#eef5ff] p-2 text-[#0071e3]">
                    <Icon className="size-4" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-[#0b1324]">{card.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-black/70">{card.summary}</p>
                  <ul className="mt-4 space-y-2">
                    {card.points.map((point) => (
                      <li key={point} className="flex items-center gap-2 text-sm text-black/82">
                        <CheckCircle2 className="size-3.5 text-[#0071e3]" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-black/10 bg-[linear-gradient(130deg,#0a1120,#121b33)] px-6 py-16 text-white sm:py-20">
        <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <p className={`${mono.className} text-xs uppercase tracking-[0.18em] text-white/65`}>
              Launch in minutes
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-4xl">
              From API config to release confidence in three concrete steps.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/75 sm:text-base">
              Whether you are validating a new feature branch or a production hotfix,
              Automix keeps the process structured and fast.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 border border-white/20 bg-white/5 px-3 py-2 text-sm text-white/80">
              <FlaskConical className="size-4 text-cyan-300" />
              Built for iterative testing and production-grade clarity
            </div>
          </div>

          <div className="space-y-3">
            {launchSequence.map((step, index) => (
              <article
                key={step.title}
                className="border border-white/20 bg-white/6 p-4 backdrop-blur-sm motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-4"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-8 shrink-0 items-center justify-center border border-white/25 bg-white/10 text-sm font-semibold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-base font-semibold">{step.title}</p>
                    <p className="mt-1 text-sm leading-7 text-white/75">{step.description}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-14 sm:py-18">
        <div className="mx-auto grid w-full max-w-6xl gap-6 border border-black bg-black p-6 text-white sm:p-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div>
            <p className={`${mono.className} text-xs uppercase tracking-[0.18em] text-white/60`}>
              Ready to ship with confidence
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-4xl">
              Build your first scenario in under ten minutes.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/75 sm:text-base">
              Start with one critical user flow, keep expanding coverage, and transform
              API QA into a predictable release ritual.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center gap-2 bg-[#0071e3] px-5 text-sm font-semibold text-white transition hover:bg-[#005bb5]"
            >
              Get started now
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/runs"
              className="inline-flex h-11 items-center justify-center gap-2 border border-white/25 bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              <Clock3 className="size-4" />
              View run dashboard
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
