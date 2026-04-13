import Link from "next/link";

import { Compass, Home, RotateCcw } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

const quickLinks = [
  { href: "/api-configs", label: "API Configs" },
  { href: "/scenarios", label: "Scenarios" },
  { href: "/runs", label: "Runs" },
  { href: "/help", label: "Help" },
];

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col bg-[#f5f5f7]">
      <section className="border-b border-white/20 bg-black px-6 py-14 sm:py-20">
        <div className="mx-auto w-full max-w-5xl">
          <p className="text-xs uppercase tracking-[0.2em] text-white/70">
            Automix Platform
          </p>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-[1.08] tracking-[-0.02em] text-white sm:text-5xl">
            404: The page you requested does not exist.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
            The URL may be outdated, typed incorrectly, or the resource has moved.
            Use one of the actions below to continue.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/" className={buttonVariants({ size: "lg" })}>
              <Home className="size-4" />
              Go Home
            </Link>
            <Link
              href="/scenarios"
              className={buttonVariants({ size: "lg", variant: "outline" })}
            >
              <Compass className="size-4" />
              Open Scenarios
            </Link>
            <Link
              href="/api-configs"
              className={buttonVariants({ size: "lg", variant: "secondary" })}
            >
              <RotateCcw className="size-4" />
              Restart From API Configs
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-10 sm:py-14">
        <div className="mx-auto w-full max-w-5xl border border-border bg-card p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Quick Navigation
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.015em] text-card-foreground sm:text-3xl">
            Continue where you left off
          </h2>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {quickLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex h-11 items-center justify-between border border-border bg-muted/40 px-4 text-sm font-medium text-foreground transition hover:bg-muted/70"
                >
                  <span>{item.label}</span>
                  <span aria-hidden="true" className="text-muted-foreground">
                    /&gt;
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}