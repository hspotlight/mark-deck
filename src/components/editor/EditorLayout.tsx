"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EditorView } from "@codemirror/view";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Box from "@mui/material/Box";
import { EditorProvider, useEditor } from "@/contexts/EditorContext";
import { useAuth } from "@/contexts/AuthContext";
import { getDeck } from "@/modules/deck-repository";
import CodeMirrorEditor from "./CodeMirrorEditor";
import Toolbar from "./Toolbar";
import PreviewPanel from "./PreviewPanel";
import SlugBar from "./SlugBar";
import type { Deck } from "@/types";

// ─── Anonymous editor shell (no deckId) ──────────────────────────────────────

function AnonEditorShellInner() {
  const { markdown, theme, setMarkdown } = useEditor();
  const { user } = useAuth();
  const viewRef = useRef<EditorView | null>(null);

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
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
            sx={{ fontSize: 12, textTransform: "none" }}
            onClick={() => {
              if (markdown) {
                sessionStorage.setItem("pendingMigrationMarkdown", markdown);
                sessionStorage.setItem("pendingMigrationTheme", theme);
              }
              window.location.href = "/login";
            }}
          >
            Sign In
          </Button>
        )}
      </header>

      <div className="md:hidden flex flex-1 items-center justify-center p-8 text-center">
        <div>
          <p className="text-slate-600 font-medium mb-2">Best viewed on desktop</p>
          <p className="text-slate-400 text-sm">
            The editor works best on a screen wider than 768px.
          </p>
        </div>
      </div>

      <div className="hidden md:flex flex-col flex-1 overflow-hidden">
        <Toolbar viewRef={viewRef} />
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <CodeMirrorEditor
              value={markdown}
              onChange={setMarkdown}
              viewRef={viewRef}
            />
          </div>
          <div className="w-px bg-[#E2E8F0] shrink-0" />
          <div className="flex-1 overflow-hidden">
            <PreviewPanel />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Authenticated editor shell (with deckId) ─────────────────────────────────

function SaveStatusIndicator() {
  const { saveStatus } = useEditor();

  if (saveStatus === "idle") return null;

  const label =
    saveStatus === "saving"
      ? "Saving..."
      : saveStatus === "saved"
      ? "Saved ✓"
      : "Unsaved changes";
  const color =
    saveStatus === "saved" ? "#10B981" : "#F59E0B";

  return (
    <span style={{ fontSize: 12, color, fontWeight: 500 }}>{label}</span>
  );
}

interface AuthEditorShellProps {
  deck: Deck;
}

function AuthEditorShell({ deck }: AuthEditorShellProps) {
  const {
    markdown,
    theme,
    title,
    description,
    setMarkdown,
    setTheme,
    setTitle,
    setDescription,
    setVisibilityImmediate,
    initFromDeck,
    showSaveError,
    dismissSaveError,
    slugEditedManually,
    setSlugEditedManually,
  } = useEditor();

  const viewRef = useRef<EditorView | null>(null);
  const [visibility, setVisibility] = useState(deck.visibility);
  const [slug, setSlug] = useState(deck.slug);
  const [publishedAt, setPublishedAt] = useState(deck.publishedAt);
  const [toastMsg, setToastMsg] = useState("");

  // Seed context once on mount
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    initFromDeck({
      deckId: deck.id,
      markdown: deck.markdown ?? "",
      theme: deck.theme ?? "default",
      title: deck.title ?? "",
      description: deck.description ?? "",
    });
  }, [deck, initFromDeck]);

  // Auto-update slug from title (if not manually edited and not published)
  const prevTitleRef = useRef(title);
  useEffect(() => {
    if (!publishedAt && !slugEditedManually && title !== prevTitleRef.current) {
      prevTitleRef.current = title;
      const newSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 60)
        .replace(/^-|-$/g, "");
      if (newSlug) setSlug(newSlug);
    }
    prevTitleRef.current = title;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  async function handleVisibilityChange(
    v: "public" | "unlisted" | "private"
  ) {
    setVisibility(v);
    await setVisibilityImmediate(v);
  }

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Editor header */}
      <header
        className="flex items-center justify-between px-4 border-b border-slate-200 bg-white shrink-0 gap-4"
        style={{ height: 56 }}
      >
        {/* Left: back arrow */}
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-sm text-slate-500 no-underline hover:text-slate-900 transition-colors shrink-0"
        >
          ← Dashboard
        </Link>

        {/* Center: save status */}
        <div className="flex-1 flex justify-center">
          <SaveStatusIndicator />
        </div>

        {/* Right: visibility + action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Select
            value={visibility}
            onChange={(e) =>
              handleVisibilityChange(e.target.value as "public" | "unlisted" | "private")
            }
            size="small"
            variant="outlined"
            sx={{
              fontSize: 12,
              height: 32,
              minWidth: 110,
              ".MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" },
            }}
            data-testid="visibility-select"
          >
            <MenuItem value="public" sx={{ fontSize: 13 }}>🌐 Public</MenuItem>
            <MenuItem value="unlisted" sx={{ fontSize: 13 }}>🔗 Unlisted</MenuItem>
            <MenuItem value="private" sx={{ fontSize: 13 }}>🔒 Private</MenuItem>
          </Select>

          <Button
            variant="contained"
            size="small"
            disableElevation
            onClick={() => setToastMsg("Publish coming soon")}
            sx={{
              textTransform: "none",
              fontSize: 12,
              height: 32,
              bgcolor: "#6366F1",
              "&:hover": { bgcolor: "#4F46E5" },
            }}
          >
            Publish
          </Button>

          <Button
            variant="outlined"
            size="small"
            onClick={() => setToastMsg("Export coming soon")}
            sx={{
              textTransform: "none",
              fontSize: 12,
              height: 32,
              borderColor: "#E2E8F0",
            }}
          >
            Export PDF
          </Button>
        </div>
      </header>

      {/* Mobile warning */}
      <div className="md:hidden flex flex-1 items-center justify-center p-8 text-center">
        <div>
          <p className="text-slate-600 font-medium mb-2">Best viewed on desktop</p>
          <p className="text-slate-400 text-sm">
            The editor works best on a screen wider than 768px.
          </p>
        </div>
      </div>

      {/* Desktop editor */}
      <div className="hidden md:flex flex-col flex-1 overflow-hidden">
        {/* Title + description */}
        <div className="px-5 pt-4 pb-0 border-b border-slate-100 bg-white">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Deck"
            className="w-full text-2xl font-bold text-slate-900 placeholder-slate-300 bg-transparent border-0 outline-none focus:outline-none mb-1"
            data-testid="deck-title-input"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description (optional)"
            className="w-full text-sm text-slate-400 placeholder-slate-300 bg-transparent border-0 outline-none focus:outline-none mb-2"
            data-testid="deck-description-input"
          />

          <SlugBar
            slug={slug}
            publishedAt={publishedAt}
            onSlugChange={(newSlug) => {
              setSlug(newSlug);
              setSlugEditedManually(true);
            }}
            onUsernameSet={() => setPublishedAt(null)}
          />
        </div>

        {/* Toolbar */}
        <Toolbar viewRef={viewRef} />

        {/* Split panels */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <CodeMirrorEditor
              value={markdown}
              onChange={setMarkdown}
              viewRef={viewRef}
            />
          </div>
          <div className="w-px bg-[#E2E8F0] shrink-0" />
          <div className="flex-1 overflow-hidden">
            <PreviewPanel />
          </div>
        </div>
      </div>

      {/* Error snackbar */}
      <Snackbar
        open={showSaveError}
        autoHideDuration={5000}
        onClose={dismissSaveError}
        message="Auto-save failed — check your connection"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />

      <Snackbar
        open={Boolean(toastMsg)}
        autoHideDuration={3000}
        onClose={() => setToastMsg("")}
        message={toastMsg}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </div>
  );
}

// ─── Loading state ─────────────────────────────────────────────────────────────

function EditorLoading() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <CircularProgress />
    </Box>
  );
}

// ─── Auth editor loader (fetches deck, checks ownership) ──────────────────────

interface AuthEditorLoaderProps {
  deckId: string;
  ownerUsername?: string;
  deckSlug?: string;
}

function AuthEditorLoader({ deckId, ownerUsername, deckSlug }: AuthEditorLoaderProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      const redirect = ownerUsername && deckSlug
        ? `/${ownerUsername}/${deckSlug}/edit`
        : `/editor?deckId=${deckId}`;
      router.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }

    getDeck(deckId).then((d) => {
      if (!d) {
        router.replace("/dashboard");
        return;
      }
      if (d.ownerId !== user.uid) {
        // Redirect to public viewer
        if (ownerUsername && deckSlug) {
          router.replace(`/${ownerUsername}/${deckSlug}`);
        } else {
          router.replace("/dashboard");
        }
        return;
      }
      setDeck(d);
      setFetching(false);
    });
  }, [authLoading, user, deckId, ownerUsername, deckSlug, router]);

  if (authLoading || fetching || !deck) return <EditorLoading />;

  return (
    <EditorProvider>
      <AuthEditorShell deck={deck} />
    </EditorProvider>
  );
}

// ─── Public exports ────────────────────────────────────────────────────────────

/**
 * Anonymous editor (no deckId). Used by /editor without params.
 */
export function AnonEditorLayout() {
  return (
    <EditorProvider>
      <AnonEditorShellInner />
    </EditorProvider>
  );
}

/**
 * Authenticated editor (with deckId). Used by /editor?deckId= and /[username]/[deckSlug]/edit.
 */
export function AuthEditorLayout({
  deckId,
  ownerUsername,
  deckSlug,
}: AuthEditorLoaderProps) {
  return (
    <AuthEditorLoader
      deckId={deckId}
      ownerUsername={ownerUsername}
      deckSlug={deckSlug}
    />
  );
}

/**
 * Default export: anonymous editor (backward-compatible).
 */
export default function EditorLayout() {
  return <AnonEditorLayout />;
}
