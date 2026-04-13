import { AppTabShell } from "@/components/layout/app-tab-shell";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppTabShell>{children}</AppTabShell>;
}