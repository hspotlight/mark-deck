"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import Skeleton from "@mui/material/Skeleton";
import Snackbar from "@mui/material/Snackbar";
import { useAuth } from "@/contexts/AuthContext";
import {
  listDecks,
  createDeck,
  updateDeck,
  deleteDeck,
  FREE_TIER_LIMIT,
} from "@/modules/deck-repository";
import { generateSlug, ensureUniqueSlug } from "@/modules/slug";
import type { Deck } from "@/types";

function formatRelativeDate(date: Date | undefined): string {
  if (!date) return "";
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function DeckThumbnail({ deck }: { deck: Deck }) {
  if (deck.thumbnailUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={deck.thumbnailUrl}
        alt={deck.title}
        className="w-full h-full object-cover"
      />
    );
  }
  return (
    <div className="w-full h-full flex items-center justify-center p-4 text-center bg-[#EEF2FF]">
      <span className="text-sm font-semibold text-indigo-400 leading-snug line-clamp-3">
        {deck.title}
      </span>
    </div>
  );
}

interface DeckCardProps {
  deck: Deck;
  username: string | null | undefined;
  onRename: (deck: Deck) => void;
  onDuplicate: (deck: Deck) => void;
  onDelete: (deck: Deck) => void;
}

function DeckCard({ deck, username, onRename, onDuplicate, onDelete }: DeckCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(deck.title);
  const renameRef = useRef<HTMLInputElement>(null);

  const editorHref =
    username && deck.slug
      ? `/${username}/${deck.slug}/edit`
      : `/editor?deckId=${deck.id}`;

  function openMenu(e: React.MouseEvent<HTMLElement>) {
    e.preventDefault();
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  }

  function closeMenu() {
    setAnchorEl(null);
  }

  function startRename() {
    closeMenu();
    setRenameValue(deck.title);
    setRenaming(true);
    setTimeout(() => renameRef.current?.select(), 50);
  }

  async function commitRename() {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== deck.title) {
      await updateDeck(deck.id, { title: trimmed }).catch(() => {});
    }
    setRenaming(false);
  }

  return (
    <div
      className="group relative bg-white rounded-xl border border-slate-100 overflow-hidden hover:border-indigo-200 hover:shadow-md transition-all"
      data-testid="deck-card"
    >
      <Link href={editorHref} className="block no-underline">
        <div className="aspect-video overflow-hidden">
          <DeckThumbnail deck={deck} />
        </div>
        <div className="p-4">
          {renaming ? (
            <TextField
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") setRenaming(false);
              }}
              onClick={(e) => e.preventDefault()}
              size="small"
              fullWidth
              autoFocus
              sx={{ fontSize: 13 }}
              slotProps={{ input: { ref: renameRef } }}
              data-testid="rename-input"
            />
          ) : (
            <h3 className="text-sm font-semibold text-slate-900 mb-1 group-hover:text-[#6366F1] transition-colors line-clamp-2">
              {deck.title}
            </h3>
          )}
          <p className="text-xs text-slate-400">{formatRelativeDate(deck.updatedAt)}</p>
        </div>
      </Link>

      {/* Context menu button */}
      <button
        onClick={openMenu}
        className="absolute top-2 right-2 w-7 h-7 rounded-md bg-white/80 backdrop-blur-sm border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-slate-500 hover:text-slate-900"
        aria-label="Deck options"
        data-testid="deck-menu-btn"
      >
        ···
      </button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={closeMenu}
        slotProps={{ paper: { sx: { minWidth: 140 } } }}
      >
        <MenuItem onClick={startRename} sx={{ fontSize: 13 }} data-testid="menu-rename">
          Rename
        </MenuItem>
        <MenuItem onClick={() => { closeMenu(); onDuplicate(deck); }} sx={{ fontSize: 13 }} data-testid="menu-duplicate">
          Duplicate
        </MenuItem>
        <MenuItem
          onClick={() => { closeMenu(); onDelete(deck); }}
          sx={{ fontSize: 13, color: "#EF4444" }}
          data-testid="menu-delete"
        >
          Delete
        </MenuItem>
      </Menu>
    </div>
  );
}

function DashboardContent() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [decks, setDecks] = useState<Deck[]>([]);
  const [loadingDecks, setLoadingDecks] = useState(true);

  // New deck modal
  const [newDeckOpen, setNewDeckOpen] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState("");
  const [newDeckSubmitting, setNewDeckSubmitting] = useState(false);

  // Free tier modal
  const [limitModalOpen, setLimitModalOpen] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Deck | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Snackbar
  const [snackMsg, setSnackMsg] = useState("");

  const username = userProfile?.username ?? null;

  // Open new deck modal if ?new=1 in URL
  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setNewDeckOpen(true);
      router.replace("/dashboard");
    }
  }, [searchParams, router]);

  // Real-time deck list
  useEffect(() => {
    if (!user) return;
    const unsub = listDecks(user.uid, (updatedDecks) => {
      setDecks(updatedDecks);
      setLoadingDecks(false);
    });
    return unsub;
  }, [user]);

  async function handleCreateDeck() {
    if (!user) return;
    const title = newDeckTitle.trim() || "Untitled Deck";
    setNewDeckSubmitting(true);
    try {
      const baseSlug = generateSlug(title);
      const slug = await ensureUniqueSlug(user.uid, baseSlug);
      const deckId = await createDeck({
        title,
        markdown: "",
        theme: "default",
        ownerId: user.uid,
        visibility: "unlisted",
        slug,
      });
      setNewDeckOpen(false);
      setNewDeckTitle("");
      const href = username && slug ? `/${username}/${slug}/edit` : `/editor?deckId=${deckId}`;
      router.push(href);
    } catch (err) {
      if ((err as { code?: string }).code === FREE_TIER_LIMIT) {
        setNewDeckOpen(false);
        setLimitModalOpen(true);
      } else {
        setSnackMsg("Failed to create deck. Try again.");
      }
    } finally {
      setNewDeckSubmitting(false);
    }
  }

  async function handleDuplicate(deck: Deck) {
    if (!user) return;
    try {
      const title = `${deck.title} (copy)`;
      const baseSlug = generateSlug(title);
      const slug = await ensureUniqueSlug(user.uid, baseSlug);
      await createDeck({
        title,
        markdown: deck.markdown ?? "",
        theme: deck.theme ?? "default",
        ownerId: user.uid,
        visibility: "unlisted",
        slug,
      });
    } catch (err) {
      if ((err as { code?: string }).code === FREE_TIER_LIMIT) {
        setLimitModalOpen(true);
      } else {
        setSnackMsg("Failed to duplicate deck.");
      }
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteSubmitting(true);
    // Optimistic update
    setDecks((prev) => prev.filter((d) => d.id !== deleteTarget.id));
    try {
      await deleteDeck(deleteTarget.id);
    } catch {
      setSnackMsg("Failed to delete deck.");
      // Restore is handled by the real-time listener
    } finally {
      setDeleteSubmitting(false);
      setDeleteTarget(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Decks</h1>

      {loadingDecks ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* + New Deck card */}
          <button
            onClick={() => {
              if (decks.length >= 1) {
                setLimitModalOpen(true);
              } else {
                setNewDeckOpen(true);
              }
            }}
            className="aspect-[4/3] rounded-xl border-2 border-dashed border-slate-200 bg-white hover:bg-neutral-50 hover:border-indigo-300 transition-all flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-indigo-500"
            data-testid="new-deck-card"
          >
            <span className="text-3xl font-light">+</span>
            <span className="text-xs font-medium">New Deck</span>
          </button>

          {/* Deck cards */}
          {decks.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              username={username}
              onRename={() => {}} // handled inline in DeckCard
              onDuplicate={handleDuplicate}
              onDelete={(d) => setDeleteTarget(d)}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loadingDecks && decks.length === 0 && (
        <div className="mt-16 flex flex-col items-center gap-3 text-center" data-testid="empty-state">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-3xl">
            📑
          </div>
          <p className="text-slate-600 font-medium">No decks yet — create your first one</p>
          <p className="text-slate-400 text-sm">Click the + card above to get started.</p>
        </div>
      )}

      {/* New Deck modal */}
      <Dialog
        open={newDeckOpen}
        onClose={() => { if (!newDeckSubmitting) setNewDeckOpen(false); }}
        fullWidth
        maxWidth="xs"
        slotProps={{ paper: { sx: { borderRadius: 2 } } }}
      >
        <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>New Deck</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            value={newDeckTitle}
            onChange={(e) => setNewDeckTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !newDeckSubmitting) handleCreateDeck(); }}
            fullWidth
            autoFocus
            size="small"
            slotProps={{ htmlInput: { maxLength: 100 } }}
            sx={{ mt: 1 }}
            data-testid="new-deck-title-input"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setNewDeckOpen(false)}
            disabled={newDeckSubmitting}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disableElevation
            onClick={handleCreateDeck}
            disabled={newDeckSubmitting}
            sx={{ textTransform: "none", bgcolor: "#6366F1", "&:hover": { bgcolor: "#4F46E5" } }}
            startIcon={newDeckSubmitting ? <CircularProgress size={14} color="inherit" /> : null}
            data-testid="new-deck-submit"
          >
            {newDeckSubmitting ? "Creating…" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Free tier limit modal */}
      <Dialog
        open={limitModalOpen}
        onClose={() => setLimitModalOpen(false)}
        fullWidth
        maxWidth="xs"
        slotProps={{ paper: { sx: { borderRadius: 2 } } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Free plan limit reached</DialogTitle>
        <DialogContent>
          <p className="text-sm text-slate-600">
            You&apos;ve reached the free plan limit of 1 deck. Pro is coming soon —
            join the waitlist to get early access.
          </p>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setLimitModalOpen(false)} sx={{ textTransform: "none" }}>
            Maybe later
          </Button>
          <Button
            variant="contained"
            disableElevation
            component={Link}
            href="/waitlist"
            sx={{ textTransform: "none", bgcolor: "#6366F1", "&:hover": { bgcolor: "#4F46E5" } }}
          >
            Join waitlist
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => { if (!deleteSubmitting) setDeleteTarget(null); }}
        fullWidth
        maxWidth="xs"
        slotProps={{ paper: { sx: { borderRadius: 2 } } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Delete &ldquo;{deleteTarget?.title}&rdquo;?
        </DialogTitle>
        <DialogContent>
          <p className="text-sm text-slate-600">This cannot be undone.</p>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteTarget(null)}
            disabled={deleteSubmitting}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disableElevation
            onClick={handleDelete}
            disabled={deleteSubmitting}
            sx={{ textTransform: "none", bgcolor: "#EF4444", "&:hover": { bgcolor: "#DC2626" } }}
            startIcon={deleteSubmitting ? <CircularProgress size={14} color="inherit" /> : null}
            data-testid="confirm-delete"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(snackMsg)}
        autoHideDuration={3000}
        onClose={() => setSnackMsg("")}
        message={snackMsg}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}
