"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface AppTabShellProps {
  children: React.ReactNode;
}

const APP_TABS = [
  {
    href: "/api-configs",
    label: "API Configs",
  },
  {
    href: "/scenarios",
    label: "Scenarios",
  },
  {
    href: "/runs",
    label: "Runs",
  },
] as const;

function isTabActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function AppShellLoadingState() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <Skeleton className="h-8 w-44" />
      <Skeleton className="h-14 w-full rounded-2xl" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </main>
  );
}

export function AppTabShell({ children }: AppTabShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, authLoading, logout } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  async function handleLogout(): Promise<void> {
    await logout();
    router.replace("/login");
  }

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fffbeb,transparent_52%),linear-gradient(155deg,#fffdf7,#f8fafc_55%,#eef2ff)]">
        <AppShellLoadingState />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fffbeb,transparent_52%),linear-gradient(155deg,#fffdf7,#f8fafc_55%,#eef2ff)]">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Automix Control Panel
              </p>
              <h1 className="text-lg font-semibold text-foreground">Workspace</h1>
            </div>
            <div className="flex items-center gap-2">
              <p className="hidden text-sm text-muted-foreground sm:block">
                {user?.email}
              </p>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>

          <nav className="overflow-x-auto pb-1">
            <div className="inline-flex min-w-full items-center gap-1 rounded-2xl border border-border bg-card/85 p-1 sm:min-w-0">
              {APP_TABS.map((tab) => {
                const active = isTabActive(pathname, tab.href);

                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={cn(
                      "inline-flex h-9 flex-1 items-center justify-center rounded-xl px-3 text-sm font-medium transition",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-7 sm:px-6 sm:py-8">
        {children}
      </div>
    </div>
  );
}