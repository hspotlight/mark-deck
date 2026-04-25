"use client";

import { useEffect, useRef } from "react";
import {
  EditorView,
  ViewPlugin,
  Decoration,
  type DecorationSet,
  WidgetType,
  keymap,
  placeholder,
} from "@codemirror/view";
import { EditorState, RangeSetBuilder } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";

// --- Slide separator widget ---

class SlideSeparatorWidget extends WidgetType {
  toDOM(): HTMLElement {
    const wrap = document.createElement("div");
    wrap.style.cssText =
      "display:flex;align-items:center;gap:8px;padding:4px 0;cursor:default;user-select:none;";
    const line = document.createElement("div");
    line.style.cssText =
      "flex:1;height:2px;background:#E2E8F0;border-radius:1px;";
    const label = document.createElement("span");
    label.textContent = "slide";
    label.style.cssText =
      "font-size:10px;color:#94A3B8;font-family:monospace;letter-spacing:0.05em;text-transform:uppercase;white-space:nowrap;";
    const line2 = document.createElement("div");
    line2.style.cssText =
      "flex:1;height:2px;background:#E2E8F0;border-radius:1px;";
    wrap.appendChild(line);
    wrap.appendChild(label);
    wrap.appendChild(line2);
    return wrap;
  }
  ignoreEvent() {
    return false;
  }
}

const slideSeparatorPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.buildDecorations(view);
    }

    update(update: { docChanged: boolean; viewportChanged: boolean; view: EditorView }) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = this.buildDecorations(update.view);
      }
    }

    buildDecorations(view: EditorView): DecorationSet {
      const builder = new RangeSetBuilder<Decoration>();
      for (const { from, to } of view.visibleRanges) {
        let pos = from;
        while (pos <= to) {
          const line = view.state.doc.lineAt(pos);
          if (line.text === "---") {
            builder.add(
              line.from,
              line.to,
              Decoration.replace({ widget: new SlideSeparatorWidget() })
            );
          }
          pos = line.to + 1;
        }
      }
      return builder.finish();
    }
  },
  { decorations: (v) => v.decorations }
);

// --- Editor theme ---

const editorTheme = EditorView.theme({
  "&": {
    height: "100%",
    fontSize: "14px",
    fontFamily: "var(--font-jetbrains-mono, 'JetBrains Mono', monospace)",
    backgroundColor: "#FFFFFF",
  },
  ".cm-content": {
    padding: "16px 20px",
    lineHeight: "1.6",
    caretColor: "#6366F1",
  },
  ".cm-focused": { outline: "none" },
  ".cm-scroller": { overflow: "auto", height: "100%" },
  ".cm-placeholder": { color: "#94A3B8", fontStyle: "italic" },
  ".cm-line": { padding: "0" },
  "&.cm-focused .cm-cursor": { borderLeftColor: "#6366F1", borderLeftWidth: "2px" },
  ".cm-selectionBackground": { backgroundColor: "#EEF2FF !important" },
  "&.cm-focused .cm-selectionBackground": { backgroundColor: "#C7D2FE !important" },
});

// --- Props ---

interface Props {
  value: string;
  onChange: (value: string) => void;
  viewRef?: React.MutableRefObject<EditorView | null>;
}

export default function CodeMirrorEditor({ value, onChange, viewRef }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const internalViewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!containerRef.current) return;

    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          history(),
          markdown(),
          editorTheme,
          slideSeparatorPlugin,
          placeholder("# My First Slide\n\nStart writing..."),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChangeRef.current(update.state.doc.toString());
            }
          }),
          EditorView.lineWrapping,
        ],
      }),
      parent: containerRef.current,
    });

    internalViewRef.current = view;
    if (viewRef) viewRef.current = view;

    return () => {
      view.destroy();
      internalViewRef.current = null;
      if (viewRef) viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value changes (e.g. from toolbar "New Slide" insert)
  useEffect(() => {
    const view = internalViewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      className="h-full overflow-hidden"
      data-testid="codemirror-editor"
    />
  );
}
