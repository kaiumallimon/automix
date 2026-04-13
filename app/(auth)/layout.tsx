export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="relative flex flex-1 items-center justify-center bg-[#f5f5f7] px-4 py-10 sm:px-6">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-black" />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </main>
  );
}
