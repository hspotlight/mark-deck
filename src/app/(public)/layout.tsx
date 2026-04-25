import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header
        className="flex items-center justify-between px-6 md:px-12 border-b border-slate-100 bg-white"
        style={{ height: 56 }}
      >
        <Link
          href="/"
          className="text-sm font-bold font-mono text-slate-900 no-underline"
        >
          mark-deck
        </Link>
        <Link
          href="/login"
          className="text-sm font-medium text-[#6366F1] no-underline hover:underline"
        >
          Sign In
        </Link>
      </header>
      {children}
    </>
  );
}
