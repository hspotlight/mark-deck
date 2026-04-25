import type { Metadata } from "next";
import Button from "@mui/material/Button";

export const metadata: Metadata = {
  title: "Page not found — mark-deck",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-6 text-center font-sans">
      <span className="text-8xl font-black text-slate-100 leading-none select-none mb-6">
        404
      </span>
      <h1 className="text-2xl font-bold text-slate-900 mb-3">
        This page doesn&apos;t exist or was removed
      </h1>
      <p className="text-slate-500 mb-8 max-w-sm">
        The deck, profile, or route you&apos;re looking for isn&apos;t here.
        It may have been deleted or the URL may be wrong.
      </p>
      <Button variant="contained" href="/">
        Go to homepage
      </Button>
    </div>
  );
}
