"use client";

import { useRef } from "react";
import { EditorView } from "@codemirror/view";
import Link from "next/link";
import Button from "@mui/material/Button";
import { EditorProvider, useEditor } from "@/contexts/EditorContext";
import { useAuth } from "@/contexts/AuthContext";
import CodeMirrorEditor from "./CodeMirrorEditor";
import Toolbar from "./Toolbar";
import PreviewPanel from "./PreviewPanel";

function EditorShell() {
  const { user } = useAuth();
  const { markdown, setMarkdown } = useEditor();
  const viewRef = useRef<EditorView | null>(null);

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 border-b border-slate-200 bg-white shrink-0"
        style={{ height: 56 }}
      >
        <Link
          href="/"
          className="text-sm font-bold text-slate-900 font-mono no-underline"
        >
          mark-deck
        </Link>

        {!user && (
          <p className="text-xs text-slate-500 hidden sm:block">
            You&apos;re in guest mode — sign in to save and publish your deck
          </p>
        )}

        {!user && (
          <Button
            variant="contained"
            size="small"
            href="/login"
            sx={{ fontSize: 12, textTransform: "none" }}
          >
            Sign In
          </Button>
        )}
      </header>

      {/* Mobile warning */}
      <div className="md:hidden flex flex-1 items-center justify-center p-8 text-center">
        <div>
          <p className="text-slate-600 font-medium mb-2">
            Best viewed on desktop
          </p>
          <p className="text-slate-400 text-sm">
            The editor works best on a screen wider than 768px.
          </p>
        </div>
      </div>

      {/* Editor + preview (desktop only) */}
      <div className="hidden md:flex flex-col flex-1 overflow-hidden">
        {/* Toolbar */}
        <Toolbar viewRef={viewRef} />

        {/* Split panels */}
        <div className="flex flex-1 overflow-hidden">
          {/* Editor panel */}
          <div className="flex-1 overflow-hidden">
            <CodeMirrorEditor
              value={markdown}
              onChange={setMarkdown}
              viewRef={viewRef}
            />
          </div>

          {/* Divider */}
          <div className="w-px bg-[#E2E8F0] shrink-0" />

          {/* Preview panel */}
          <div className="flex-1 overflow-hidden">
            <PreviewPanel />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditorLayout() {
  return (
    <EditorProvider>
      <EditorShell />
    </EditorProvider>
  );
}
