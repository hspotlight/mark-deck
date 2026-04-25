# 11 — Dashboard + Deck CRUD

**Group:** C – Logged-In User
**Type:** AFK
**Blocked by:** #08 Authentication, #10 Navigation Bar

---

## What to build

The `/dashboard` page showing the user's deck library as a grid. Includes a "New Deck" modal (title only), deck cards with thumbnails, and a context menu for rename/duplicate/delete. Also houses `DeckRepository` — the single module for all Firestore deck operations.

---

## Acceptance criteria

### DeckRepository (`src/modules/deckRepository.ts`)
- [ ] Exports: `createDeck`, `getDeck`, `listDecks`, `updateDeck`, `deleteDeck`, `incrementViewCount`, `incrementDownloadCount`
- [ ] `createDeck(userId, data)`: writes a new deck document; throws `FREE_TIER_LIMIT` if user already has ≥ 1 deck (free tier check)
- [ ] `listDecks(userId)`: returns all decks for the user ordered by `updatedAt` descending, real-time listener via `onSnapshot`
- [ ] `updateDeck(deckId, data)`: partial update; enforces that `slug` cannot change if `publishedAt` is set
- [ ] `deleteDeck(deckId)`: deletes the Firestore document and all Storage files under `exports/{userId}/{deckId}/` and `images/{userId}/` that belong to this deck (batch delete via Cloud Function or client SDK — at MVP, client SDK delete of known URLs is acceptable)
- [ ] `incrementViewCount` / `incrementDownloadCount`: use `FieldValue.increment(1)`, no read

### SlugModule (`src/modules/slug.ts`)
- [ ] `generateSlug(title: string): string` — converts title to kebab-case, strips non-alphanumeric chars, max 60 chars
- [ ] `ensureUniqueSlug(userId, baseSlug): Promise<string>` — queries Firestore for existing slugs for this user; appends `-2`, `-3` etc. until unique
- [ ] Pure function tests for `generateSlug`; integration test for `ensureUniqueSlug` against emulator

### Dashboard page (`/dashboard`)
- [ ] Auth-gated via `AuthGuard` (#08)
- [ ] Subscribes to `listDecks(user.uid)` via real-time listener — deck cards update live
- [ ] Grid layout: `grid-cols-4` on desktop, `grid-cols-2` on tablet, `grid-cols-1` on mobile
- [ ] **"+ New Deck" card** always shown at top-left: white card with `+` icon centered, dashed border, hover state (`bg-neutral-50`)

### New Deck modal
- [ ] Clicking "+ New Deck" card opens a MUI `Dialog`
- [ ] Single input: deck title (required, max 100 chars)
- [ ] On submit: calls `createDeck` → generates slug via `SlugModule.generateSlug` + `ensureUniqueSlug` → navigates to `/[username]/[deckSlug]/edit`
- [ ] If user has no `username` yet: deck is created with `username: null`; navigation goes to `/editor?deckId={deckId}` until username is set (username is set on first publish in #13)
- [ ] If free tier limit reached: shows the limit modal instead of opening the new deck modal (see #17)
- [ ] Loading spinner on submit button while Firestore write is in flight

### Deck cards
- [ ] Each card: thumbnail (or placeholder), title, last edited date relative (e.g. "2 days ago")
- [ ] Clicking the card body navigates to the deck editor
- [ ] `...` icon button (top-right of card on hover) opens context menu

### Context menu
- [ ] MUI `Menu` with items: **Rename**, **Duplicate**, **Delete**
- [ ] **Rename:** opens an inline MUI `TextField` in the card header (replace title text); pressing Enter or clicking away saves via `updateDeck`
- [ ] **Duplicate:** calls `createDeck` with title `"{original title} (copy)"`, copies markdown + theme; free tier check applies (if at limit, show limit modal instead)
- [ ] **Delete:** opens a confirmation MUI `Dialog` ("Delete "{title}"? This cannot be undone.") → on confirm, calls `deleteDeck`; card disappears from grid immediately (optimistic update)

### Empty state
- [ ] If user has no decks, show empty state with illustration/icon and text: *"No decks yet — create your first one"*

### Tests
- [ ] Jest unit (SlugModule): `generateSlug('My React Talk!')` → `'my-react-talk'`; `generateSlug('  Spaces  ')` → `'spaces'`; slug truncation at 60 chars
- [ ] Jest unit (DeckRepository): mock Firestore — `createDeck` throws when user already has 1 deck; succeeds with 0 decks
- [ ] Playwright (emulator): sign in → assert empty state → click "+ New Deck" → enter title → submit → assert deck card appears in grid → click `...` → Rename → enter new title → assert card shows new title → Delete → confirm → assert card gone
- [ ] Playwright: duplicate a deck → assert new card with "(copy)" title appears
- [ ] Playwright: free tier — create 1 deck → click "+ New Deck" again → assert limit modal shown, no deck created

---

## Implementation notes

- **Real-time listener:** Use `onSnapshot` in a `useEffect` with a cleanup that calls the unsubscribe function. Return a `loading` state from the hook so the grid can show skeletons while the first snapshot arrives.
- **Optimistic delete:** Remove the deck from local state immediately on confirm, then call `deleteDeck`. On error, restore the card and show an error snackbar.
- **Thumbnail placeholder:** Until export is built (#14), all thumbnails show the placeholder (deck title on a colored background using the theme's primary color).
- **`DeckRepository` as a module, not a class:** Export plain async functions. They are easier to mock in Jest than class methods.
