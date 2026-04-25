"use client";

import { useEffect, useRef, useState } from "react";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import { collection, query, where, getDocs, doc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useEditor } from "@/contexts/EditorContext";
import { generateSlug, ensureUniqueSlug } from "@/modules/slug";
import { updateDeck } from "@/modules/deck-repository";

interface Props {
  slug: string;
  publishedAt: Date | null | undefined;
  onSlugChange: (newSlug: string) => void;
  /** Called after username is confirmed and publish should proceed */
  onUsernameSet?: () => void;
}

function validateUsername(value: string): string | null {
  if (value.length < 3 || value.length > 20) return "Must be 3–20 characters.";
  if (!/^[a-z0-9-]+$/.test(value)) return "Only lowercase letters, numbers, and hyphens.";
  if (value.startsWith("-") || value.endsWith("-")) return "Cannot start or end with a hyphen.";
  return null;
}

export default function SlugBar({ slug, publishedAt, onSlugChange, onUsernameSet }: Props) {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const { deckId, setSlugEditedManually } = useEditor();
  const isLocked = Boolean(publishedAt);

  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(slug);
  const slugInputRef = useRef<HTMLInputElement>(null);

  // Username dialog
  const [usernameDialogOpen, setUsernameDialogOpen] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [usernameSubmitting, setUsernameSubmitting] = useState(false);

  const username = userProfile?.username ?? null;

  // Sync editValue when slug prop changes from outside
  useEffect(() => {
    if (!editing) setEditValue(slug);
  }, [slug, editing]);

  function startEditing() {
    if (isLocked) return;
    setEditing(true);
    setEditValue(slug);
    setTimeout(() => slugInputRef.current?.select(), 30);
  }

  async function commitSlugEdit() {
    setEditing(false);
    if (!user || !deckId) return;

    const normalized = editValue
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60);

    if (!normalized || normalized === slug) {
      setEditValue(slug);
      return;
    }

    const finalSlug = await ensureUniqueSlug(user.uid, normalized);
    setSlugEditedManually(true);
    onSlugChange(finalSlug);
    await updateDeck(deckId, { slug: finalSlug }).catch(() => {});
    setEditValue(finalSlug);
  }

  async function handleUsernameSubmit() {
    const trimmed = usernameInput.trim().toLowerCase();
    const validationError = validateUsername(trimmed);
    if (validationError) {
      setUsernameError(validationError);
      return;
    }

    setUsernameSubmitting(true);
    setUsernameError("");

    try {
      // Check uniqueness
      const q = query(collection(db, "users"), where("username", "==", trimmed));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setUsernameError("This handle is already taken.");
        return;
      }

      if (!user) return;

      // Batch write: update users/{uid} + all existing decks
      const batch = writeBatch(db);
      batch.update(doc(db, "users", user.uid), { username: trimmed });

      const decksSnap = await getDocs(
        query(collection(db, "decks"), where("ownerId", "==", user.uid))
      );
      decksSnap.docs.forEach((d) => batch.update(d.ref, { username: trimmed }));

      await batch.commit();
      await refreshUserProfile();

      setUsernameDialogOpen(false);
      setUsernameInput("");
      onUsernameSet?.();
    } catch {
      setUsernameError("Something went wrong. Please try again.");
    } finally {
      setUsernameSubmitting(false);
    }
  }

  const displayUsername = username ?? "[choose username]";

  return (
    <>
      <div className="flex items-center gap-1 text-xs text-slate-400 px-4 py-1.5 border-b border-slate-100 bg-white font-mono overflow-hidden">
        <span>mark-deck.com</span>
        <span>/</span>

        {/* Username segment */}
        {username ? (
          <span className="text-slate-500">{username}</span>
        ) : (
          <button
            onClick={() => setUsernameDialogOpen(true)}
            className="text-[#6366F1] hover:underline font-semibold"
            data-testid="choose-username-cta"
          >
            {displayUsername}
          </button>
        )}

        <span>/</span>

        {/* Slug segment */}
        {isLocked ? (
          <Tooltip title="Slug is locked to keep your shared links working" placement="bottom">
            <span className="flex items-center gap-1 cursor-default">
              <span className="text-slate-500 truncate max-w-[200px]">{slug}</span>
              <span className="text-slate-300">🔒</span>
            </span>
          </Tooltip>
        ) : editing ? (
          <TextField
            value={editValue}
            onChange={(e) =>
              setEditValue(
                e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9-]/g, "")
              )
            }
            onBlur={commitSlugEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitSlugEdit();
              if (e.key === "Escape") { setEditing(false); setEditValue(slug); }
            }}
            size="small"
            variant="standard"
            sx={{
              "& .MuiInputBase-input": { fontSize: 12, fontFamily: "monospace", padding: "0 2px" },
              "& .MuiInput-underline:before": { borderBottomColor: "#6366F1" },
            }}
            slotProps={{ input: { ref: slugInputRef }, htmlInput: { "data-testid": "slug-input" } }}
          />
        ) : (
          <button
            onClick={startEditing}
            className="text-slate-500 hover:text-[#6366F1] hover:underline truncate max-w-[200px]"
            data-testid="slug-edit-btn"
          >
            {slug || "untitled"}
          </button>
        )}
      </div>

      {/* Username selection dialog */}
      <Dialog
        open={usernameDialogOpen}
        onClose={() => { if (!usernameSubmitting) { setUsernameDialogOpen(false); setUsernameInput(""); setUsernameError(""); } }}
        fullWidth
        maxWidth="xs"
        slotProps={{ paper: { sx: { borderRadius: 2 } } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Choose your username</DialogTitle>
        <DialogContent>
          <p className="text-sm text-slate-600 mb-1">
            Your public handle. <strong>This cannot be changed later.</strong>
          </p>
          <p className="text-xs text-slate-400 mb-3">
            Your decks will live at mark-deck.com/<em>username</em>
          </p>
          <TextField
            label="Your public handle"
            value={usernameInput}
            onChange={(e) => { setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")); setUsernameError(""); }}
            onKeyDown={(e) => { if (e.key === "Enter" && !usernameSubmitting) handleUsernameSubmit(); }}
            fullWidth
            autoFocus
            size="small"
            error={Boolean(usernameError)}
            helperText={usernameError || "3–20 chars, lowercase letters, numbers, hyphens only"}
            slotProps={{ htmlInput: { maxLength: 20, "data-testid": "username-input" } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => { setUsernameDialogOpen(false); setUsernameInput(""); setUsernameError(""); }}
            disabled={usernameSubmitting}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disableElevation
            onClick={handleUsernameSubmit}
            disabled={usernameSubmitting || !usernameInput}
            sx={{ textTransform: "none", bgcolor: "#6366F1", "&:hover": { bgcolor: "#4F46E5" } }}
            startIcon={usernameSubmitting ? <CircularProgress size={14} color="inherit" /> : null}
            data-testid="username-submit"
          >
            {usernameSubmitting ? "Saving…" : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
