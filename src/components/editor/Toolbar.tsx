"use client";

import { useRef } from "react";
import { EditorView } from "@codemirror/view";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import { useEditor } from "@/contexts/EditorContext";
import { THEME_NAMES } from "@/themes";

interface Props {
  viewRef: React.RefObject<EditorView | null>;
}

function insertAtCursor(view: EditorView | null, text: string) {
  if (!view) return;
  const { from, to } = view.state.selection.main;
  view.dispatch({
    changes: { from, to, insert: text },
    selection: { anchor: from + text.length },
  });
  view.focus();
}

function wrapSelection(view: EditorView | null, before: string, after: string) {
  if (!view) return;
  const { from, to } = view.state.selection.main;
  const selected = view.state.sliceDoc(from, to);
  if (selected.length > 0) {
    view.dispatch({
      changes: { from, to, insert: `${before}${selected}${after}` },
      selection: { anchor: from + before.length + selected.length + after.length },
    });
  } else {
    const insert = `${before}${after}`;
    view.dispatch({
      changes: { from, to, insert },
      selection: { anchor: from + before.length },
    });
  }
  view.focus();
}

export default function Toolbar({ viewRef }: Props) {
  const { theme, setTheme } = useEditor();

  return (
    <div
      className="flex items-center gap-2 px-4 border-b border-slate-200 bg-white"
      style={{ height: 48, minHeight: 48 }}
    >
      {/* Theme dropdown */}
      <Select
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        size="small"
        variant="outlined"
        sx={{
          fontSize: 13,
          height: 32,
          minWidth: 140,
          ".MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" },
        }}
        data-testid="theme-select"
      >
        {Object.entries(THEME_NAMES).map(([value, label]) => (
          <MenuItem key={value} value={value} sx={{ fontSize: 13 }}>
            {label}
          </MenuItem>
        ))}
      </Select>

      <div className="w-px h-5 bg-slate-200 mx-1" />

      {/* New Slide */}
      <Button
        size="small"
        variant="outlined"
        onClick={() => insertAtCursor(viewRef.current, "\n\n---\n\n")}
        sx={{ fontSize: 12, textTransform: "none", height: 32, borderColor: "#E2E8F0" }}
        data-testid="new-slide-btn"
      >
        + Slide
      </Button>

      {/* Bold */}
      <Tooltip title="Bold (Ctrl+B)">
        <Button
          size="small"
          variant="outlined"
          onClick={() => wrapSelection(viewRef.current, "**", "**")}
          sx={{
            fontSize: 13,
            fontWeight: 700,
            height: 32,
            minWidth: 32,
            padding: "0 8px",
            borderColor: "#E2E8F0",
          }}
          data-testid="bold-btn"
        >
          B
        </Button>
      </Tooltip>

      {/* Italic */}
      <Tooltip title="Italic (Ctrl+I)">
        <Button
          size="small"
          variant="outlined"
          onClick={() => wrapSelection(viewRef.current, "*", "*")}
          sx={{
            fontSize: 13,
            fontStyle: "italic",
            height: 32,
            minWidth: 32,
            padding: "0 8px",
            borderColor: "#E2E8F0",
          }}
          data-testid="italic-btn"
        >
          I
        </Button>
      </Tooltip>

      {/* Image (auth-gated) */}
      <Tooltip title="Sign in to upload images">
        <span>
          <Button
            size="small"
            variant="outlined"
            disabled
            sx={{
              fontSize: 12,
              textTransform: "none",
              height: 32,
              borderColor: "#E2E8F0",
            }}
          >
            Image
          </Button>
        </span>
      </Tooltip>
    </div>
  );
}
