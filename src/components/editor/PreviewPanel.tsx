"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor } from "@/contexts/EditorContext";

const PLACEHOLDER_MARKDOWN = `# My First Slide

Start writing your Markdown here.`;

export default function PreviewPanel() {
  const { markdown, theme } = useEditor();
  const [html, setHtml] = useState<string>("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const source = markdown.trim() || PLACEHOLDER_MARKDOWN;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      const { renderMarp } = await import("@/modules/marp-preview");
      const rendered = renderMarp(source, theme);
      setHtml(rendered);
    }, 500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [markdown, theme]);

  return (
    <div className="h-full bg-[#F8FAFC] overflow-hidden" data-testid="preview-panel">
      {html ? (
        <iframe
          srcDoc={html}
          sandbox="allow-scripts"
          className="w-full h-full border-0"
          title="Marp slide preview"
          data-testid="preview-iframe"
        />
      ) : (
        <div className="flex items-center justify-center h-full text-slate-400 text-sm">
          Loading preview…
        </div>
      )}
    </div>
  );
}
