# 12 — Deck Editor – CodeMirror + Auto-Save

**Group:** C – Logged-In User
**Type:** AFK
**Blocked by:** #11 Dashboard + Deck CRUD

---

## What to build

The full deck editor at `/[username]/[deckSlug]/edit` (and `/editor?deckId={id}` for username-less users). Builds on the anonymous editor from #03 by adding: Firestore persistence, auto-save with status indicator, deck title/description fields, and proper `EditorContext`. The editor is the core product loop for logged-in users.

---

## Acceptance criteria

### Route & access
- [ ] Route `/[username]/[deckSlug]/edit` is auth-gated AND owner-gated: if `deck.userId != auth.uid`, redirect to the public viewer (`/[username]/[deckSlug]`)
- [ ] Route `/editor?deckId={id}` works for users whose `username` is not yet set — resolves the deck by `deckId` directly
- [ ] Loading state: while deck data is being fetched, show a centered spinner; do not flash an empty editor

### EditorContext (`src/contexts/EditorContext.tsx`)
- [ ] Holds: `markdown`, `theme`, `title`, `description`, `saveStatus: 'idle' | 'saving' | 'saved' | 'unsaved'`, `deckId`
- [ ] `setMarkdown`, `setTheme`, `setTitle`, `setDescription` — each triggers a save cycle
- [ ] `saveStatus` exposed to all editor components

### Auto-save
- [ ] On any content change (`markdown`, `title`, `description`, `theme`), `saveStatus` transitions to `'unsaved'`
- [ ] 500ms after the last change, auto-save fires: calls `DeckRepository.updateDeck(deckId, { markdown, title, description, theme, updatedAt: serverTimestamp() })`
- [ ] While saving: `saveStatus = 'saving'`
- [ ] On success: `saveStatus = 'saved'`
- [ ] On error: `saveStatus = 'unsaved'`; show error snackbar *"Auto-save failed — check your connection"*
- [ ] Save status indicator in header: `Saving...` (warning amber) / `Saved ✓` (success green) / `Unsaved changes` (warning amber)
- [ ] On page unload (`beforeunload`), if `saveStatus != 'saved'`, show browser confirmation dialog *"You have unsaved changes"*

### Deck title + description fields (above editor panels)
- [ ] Title input: full-width text input, bold 1.5rem font, no visible border until focused, placeholder "Untitled Deck"
- [ ] Description input: full-width text input below title, lighter weight, placeholder "Add a description (optional)"
- [ ] Both fields are part of `EditorContext` and trigger auto-save

### CodeMirror + toolbar (upgraded from #03)
- [ ] All features from #03 (syntax highlighting, `---` decoration, bold/italic/new slide buttons, theme picker) carried over
- [ ] Image upload button now functional (stubbed until #15 — shows a tooltip "Image upload coming soon" if #15 not merged)
- [ ] Toolbar theme picker selection is persisted via auto-save (not just in-memory as in #03)

### Marp preview (same as #03)
- [ ] All preview behavior from #03 unchanged
- [ ] Preview reflects saved theme from Firestore on initial load

### Editor header bar (replaces the anonymous bar)
- [ ] Left: back arrow → `/dashboard`
- [ ] Center: save status indicator
- [ ] Right: **Visibility selector** (dropdown: Public / Unlisted / Private — icon + label), **Publish** button (primary), **Export PDF** button (secondary, outline)
- [ ] Visibility selector calls `DeckRepository.updateDeck` immediately on change (no save delay)
- [ ] Publish and Export buttons are stubs until #14 — clicking shows a toast *"Coming soon"*

### Initial load
- [ ] Fetches deck document from Firestore once on mount (not real-time, since the editor is single-user)
- [ ] Populates `EditorContext` with fetched `markdown`, `title`, `description`, `theme`

### Tests
- [ ] Jest unit (EditorContext): simulate `setMarkdown` → assert `saveStatus = 'unsaved'` → advance timer 500ms → assert `DeckRepository.updateDeck` called with correct payload → assert `saveStatus = 'saved'`
- [ ] Jest unit: simulate network error on `updateDeck` → assert `saveStatus` stays `'unsaved'`
- [ ] Playwright (emulator): sign in as owner → navigate to editor URL → type in editor → wait 600ms → assert Firestore document `markdown` field updated → assert save status shows "Saved ✓"
- [ ] Playwright: sign in as a different user → navigate to owner's editor URL → assert redirect to public viewer
- [ ] Playwright: change visibility dropdown → assert Firestore `visibility` field updated immediately (no 500ms delay)

---

## Implementation notes

- **Single fetch, not real-time:** The editor uses a one-time `getDoc` on mount, not `onSnapshot`. Real-time updates to the editor would overwrite the user's in-progress typing. If two tabs are open (edge case at MVP), the last save wins — acceptable.
- **`beforeunload` warning:** Use `window.addEventListener('beforeunload', handler)` in a `useEffect` with cleanup. Only attach when `saveStatus !== 'saved'`.
- **Debounce implementation:** Same pattern as #03 — `useEffect` + `clearTimeout`. The 500ms debounce applies to both Firestore save and Marp preview update; they share the same trigger but are separate calls.
- **EditorContext scope:** Wrap only the editor page layout in `EditorContext`, not the root layout. It's not needed outside the editor.
- **Owner check:** Perform server-side in the page component using `getDoc(deckRef)` + comparing `deck.userId` to the session user (via Firebase Admin SDK in a Server Component, or client-side with `useAuth()` + redirect on mismatch).
