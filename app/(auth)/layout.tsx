export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex flex-1 items-center justify-center bg-[radial-gradient(circle_at_top,#f5f5f4,transparent_55%),linear-gradient(to_bottom,#fafaf9,#f5f5f4)] px-6 py-12">
      {children}
    </main>
  );
}
