"use client";

import { createContext, useContext, useState } from "react";

interface EditorContextValue {
  markdown: string;
  theme: string;
  setMarkdown: (md: string) => void;
  setTheme: (theme: string) => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [markdown, setMarkdown] = useState("");
  const [theme, setTheme] = useState("default");

  return (
    <EditorContext.Provider value={{ markdown, theme, setMarkdown, setTheme }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used within EditorProvider");
  return ctx;
}
