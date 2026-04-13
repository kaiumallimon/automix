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
      <Skeleton className="h-14 w-full" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
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
      <div className="min-h-screen bg-[#f5f5f7]">
        <AppShellLoadingState />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <header className="sticky top-0 z-30 border-b border-white/20 bg-black/80 text-white backdrop-blur-[20px] backdrop-saturate-180">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/65">
                Automix Control Panel
              </p>
              <h1 className="text-lg font-semibold text-white">Workspace</h1>
            </div>
            <div className="flex items-center gap-2">
              <p className="hidden max-w-[18rem] truncate text-sm text-white/72 sm:block">
                {user?.email}
              </p>
              <Button
                variant="ghost"
                className="h-9 border-white/25 bg-white/8 px-3 text-white hover:bg-white/16 hover:text-white focus-visible:border-white/40 focus-visible:ring-white/30"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>

          <nav className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0">
            <div className="flex w-max min-w-full items-center gap-1 border border-white/25 bg-black/30 p-1 sm:w-full">
              {APP_TABS.map((tab) => {
                const active = isTabActive(pathname, tab.href);

                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={cn(
                      "inline-flex h-9 min-w-[7.25rem] shrink-0 items-center justify-center px-3 text-sm font-medium whitespace-nowrap transition sm:min-w-0 sm:flex-1",
                      active
                        ? "bg-[#0071e3] text-white"
                        : "text-white/75 hover:bg-white/10 hover:text-white"
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

      <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-1 px-4 py-7 sm:px-6 sm:py-8">
        {children}
      </div>
    </div>
  );
}