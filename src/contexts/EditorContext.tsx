"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { updateDeck } from "@/modules/deck-repository";

export type SaveStatus = "idle" | "unsaved" | "saving" | "saved";

interface EditorContextValue {
  markdown: string;
  theme: string;
  title: string;
  description: string;
  saveStatus: SaveStatus;
  deckId: string | null;
  slugEditedManually: boolean;
  setMarkdown: (md: string) => void;
  setTheme: (theme: string) => void;
  setTitle: (title: string) => void;
  setDescription: (desc: string) => void;
  setSlugEditedManually: (v: boolean) => void;
  /** Update visibility immediately (no debounce) */
  setVisibilityImmediate: (
    visibility: "public" | "unlisted" | "private"
  ) => Promise<void>;
  /** Called by AuthEditorShell to seed initial data from Firestore */
  initFromDeck: (opts: {
    deckId: string;
    markdown: string;
    theme: string;
    title: string;
    description: string;
  }) => void;
  showSaveError: boolean;
  dismissSaveError: () => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [markdown, _setMarkdown] = useState("");
  const [theme, _setTheme] = useState("default");
  const [title, _setTitle] = useState("");
  const [description, _setDescription] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [deckId, setDeckId] = useState<string | null>(null);
  const [slugEditedManually, setSlugEditedManually] = useState(false);
  const [showSaveError, setShowSaveError] = useState(false);

  // Refs for debounce callback (captures latest values without stale closure)
  const markdownRef = useRef(markdown);
  const themeRef = useRef(theme);
  const titleRef = useRef(title);
  const descriptionRef = useRef(description);
  const deckIdRef = useRef<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function scheduleAutosave() {
    if (!deckIdRef.current) return;
    setSaveStatus("unsaved");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!deckIdRef.current) return;
      setSaveStatus("saving");
      try {
        await updateDeck(deckIdRef.current, {
          markdown: markdownRef.current,
          title: titleRef.current,
          description: descriptionRef.current,
          theme: themeRef.current,
        });
        setSaveStatus("saved");
      } catch {
        setSaveStatus("unsaved");
        setShowSaveError(true);
      }
    }, 500);
  }

  function setMarkdown(md: string) {
    markdownRef.current = md;
    _setMarkdown(md);
    scheduleAutosave();
  }

  function setTheme(t: string) {
    themeRef.current = t;
    _setTheme(t);
    scheduleAutosave();
  }

  function setTitle(t: string) {
    titleRef.current = t;
    _setTitle(t);
    scheduleAutosave();
  }

  function setDescription(d: string) {
    descriptionRef.current = d;
    _setDescription(d);
    scheduleAutosave();
  }

  async function setVisibilityImmediate(
    visibility: "public" | "unlisted" | "private"
  ) {
    if (!deckIdRef.current) return;
    await updateDeck(deckIdRef.current, { visibility });
  }

  const initFromDeck = useCallback(
    (opts: {
      deckId: string;
      markdown: string;
      theme: string;
      title: string;
      description: string;
    }) => {
      deckIdRef.current = opts.deckId;
      markdownRef.current = opts.markdown;
      themeRef.current = opts.theme;
      titleRef.current = opts.title;
      descriptionRef.current = opts.description;
      setDeckId(opts.deckId);
      _setMarkdown(opts.markdown);
      _setTheme(opts.theme);
      _setTitle(opts.title);
      _setDescription(opts.description);
      setSaveStatus("saved");
    },
    []
  );

  // beforeunload warning when unsaved
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (saveStatus !== "saved" && saveStatus !== "idle" && deckIdRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveStatus]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <EditorContext.Provider
      value={{
        markdown,
        theme,
        title,
        description,
        saveStatus,
        deckId,
        slugEditedManually,
        setMarkdown,
        setTheme,
        setTitle,
        setDescription,
        setSlugEditedManually,
        setVisibilityImmediate,
        initFromDeck,
        showSaveError,
        dismissSaveError: () => setShowSaveError(false),
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used within EditorProvider");
  return ctx;
}
