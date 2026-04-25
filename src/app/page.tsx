import type { Metadata } from "next";
import Button from "@mui/material/Button";

export const metadata: Metadata = {
  title: "mark-deck — Write, preview, and publish Marp slides",
  description:
    "The Marp slide editor that gets out of your way. Write Markdown, preview slides live, and publish with one click.",
  openGraph: {
    title: "mark-deck — Write, preview, and publish Marp slides",
    description:
      "The Marp slide editor that gets out of your way. Write Markdown, preview slides live, and publish with one click.",
    images: [{ url: "/og-image.png" }],
  },
};

const features = [
  {
    tag: "01",
    title: "Split-panel editor",
    description: "Write Markdown on the left, see slides on the right.",
  },
  {
    tag: "02",
    title: "Live Marp preview",
    description: "Rendered slides update as you type, in real time.",
  },
  {
    tag: "03",
    title: "One-click publish",
    description: "Share your deck with a public URL instantly.",
  },
  {
    tag: "04",
    title: "Shareable URL",
    description: "Every published deck gets a clean, permanent link.",
  },
];

const steps = [
  { n: "1", label: "Write", detail: "Markdown in the editor" },
  { n: "2", label: "Preview", detail: "See your slides live" },
  { n: "3", label: "Share", detail: "Publish and copy your link" },
];

function EditorMockup() {
  return (
    <div
      className="rounded-2xl overflow-hidden border border-slate-200"
      style={{ boxShadow: "0 32px 80px -16px rgba(99,102,241,0.18)" }}
    >
      <div className="flex h-[320px] md:h-[400px]">
        {/* Editor pane */}
        <div className="flex-1 bg-[#13131f] p-5 flex flex-col min-w-0">
          <div className="flex gap-1.5 mb-5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 overflow-hidden text-[11px] leading-[1.75] font-mono select-none">
            <p className="text-slate-600">---</p>
            <p>
              <span className="text-[#c792ea]">marp</span>
              <span className="text-slate-300">: true</span>
            </p>
            <p>
              <span className="text-[#c792ea]">theme</span>
              <span className="text-slate-300">: default</span>
            </p>
            <p className="text-slate-600">---</p>
            <p className="mt-1">
              <span className="text-[#82aaff]"># </span>
              <span className="text-[#c3e88d]">Hello, World!</span>
            </p>
            <p className="text-slate-400">My first Marp slide.</p>
            <p className="mt-1 text-slate-600">---</p>
            <p>
              <span className="text-[#82aaff]">## </span>
              <span className="text-[#c3e88d]">Key Points</span>
            </p>
            <p>
              <span className="text-slate-600">- </span>
              <span className="text-slate-300">Fast iteration</span>
            </p>
            <p>
              <span className="text-slate-600">- </span>
              <span className="text-slate-300">Live preview</span>
            </p>
            <p>
              <span className="text-slate-600">- </span>
              <span className="text-slate-300">One-click share</span>
            </p>
            <span className="inline-block w-[5px] h-[13px] bg-[#6366F1] align-middle animate-pulse mt-1" />
          </div>
        </div>

        {/* Divider */}
        <div className="w-px bg-[#1e1e2e]" />

        {/* Preview pane */}
        <div className="flex-1 bg-slate-100 flex items-center justify-center p-6 min-w-0">
          <div className="w-full max-w-[190px] aspect-[4/3] bg-white rounded-lg border border-slate-200 shadow-lg flex flex-col items-center justify-center p-5 text-center gap-2">
            <div className="w-8 h-0.5 bg-[#6366F1] rounded-full" />
            <p className="text-[13px] font-bold text-slate-900 leading-snug">
              Hello, World!
            </p>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              My first Marp slide.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-14 py-5 border-b border-slate-100 bg-[#F8FAFC]/80 backdrop-blur-sm sticky top-0 z-10">
        <span className="text-base font-bold tracking-tight text-slate-900 font-mono">
          mark-deck
        </span>
        <Button variant="outlined" size="small" href="/waitlist">
          Join waitlist
        </Button>
      </nav>

      <main className="flex-1">
        {/* Hero */}
        <section className="px-6 md:px-14 pt-20 pb-16 max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] animate-pulse" />
            <span className="text-xs font-semibold text-indigo-700 tracking-wide">
              Early access
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 leading-none mb-8">
            Write.
            <br />
            <span className="text-[#6366F1]">Preview.</span>
            <br />
            Publish.
          </h1>

          <p className="text-lg md:text-xl text-slate-500 max-w-md mb-10 leading-relaxed">
            The Marp slide editor that gets out of your way.
          </p>

          <div className="flex flex-wrap gap-3 mb-16">
            <Button variant="contained" size="large" href="/editor">
              Start writing
            </Button>
            <Button variant="outlined" size="large" href="/waitlist">
              Join waitlist
            </Button>
          </div>

          <EditorMockup />
        </section>

        {/* Features */}
        <section className="px-6 md:px-14 py-24 max-w-6xl mx-auto">
          <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-12">
            What you get
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <div
                key={f.tag}
                className="bg-white rounded-xl p-6 border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all duration-200 group"
              >
                <span className="text-xs font-mono font-bold text-indigo-300 group-hover:text-indigo-500 transition-colors block mb-4">
                  {f.tag}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="bg-slate-900 py-24 px-6 md:px-14">
          <div className="max-w-6xl mx-auto">
            <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase mb-16">
              How it works
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
              {steps.map((s) => (
                <div key={s.n}>
                  <span className="text-8xl font-black text-slate-800 leading-none block mb-4 tabular-nums select-none">
                    {s.n}
                  </span>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {s.label}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {s.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 md:px-14 py-8 border-t border-slate-100 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-bold text-slate-900 font-mono">
            mark-deck
          </span>
          <div className="flex items-center gap-6">
            <a
              href="/waitlist"
              className="text-sm text-slate-500 hover:text-[#6366F1] transition-colors"
            >
              Join waitlist
            </a>
            <span className="text-sm text-slate-400">© 2025 mark-deck</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
