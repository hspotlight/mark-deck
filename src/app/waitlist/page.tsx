import type { Metadata } from "next";
import Link from "next/link";
import WaitlistFormWrapper from "./WaitlistFormWrapper";

export const metadata: Metadata = {
  title: "Join the waitlist — mark-deck",
  description: "Be the first to know when mark-deck Pro launches.",
};

export default function WaitlistPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* Nav */}
      <nav className="px-6 md:px-12 py-4 border-b border-slate-100 bg-white">
        <Link href="/" className="text-sm font-bold font-mono text-slate-900 no-underline">
          mark-deck
        </Link>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-lg w-full">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" />
            <span className="text-xs font-semibold text-indigo-700">Pro plan — coming soon</span>
          </div>

          <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-4">
            Pro is coming — be the first to know
          </h1>

          <p className="text-slate-500 leading-relaxed mb-8">
            mark-deck Pro will include unlimited decks, custom themes, HTML export,
            and priority support. Enter your email and we&apos;ll let you know the moment
            it launches.
          </p>

          <WaitlistFormWrapper />
        </div>
      </main>
    </div>
  );
}
