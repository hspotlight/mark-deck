# 09 — Anonymous → Permanent Account Migration

**Group:** B – Auth Bridge
**Type:** AFK
**Blocked by:** #03 Anonymous Editor + Marp Live Preview, #08 Authentication

---

## What to build

When a visitor who has been writing in the anonymous editor signs in for the first time, their in-memory markdown is preserved and saved to Firestore as their first deck. The transition must be seamless — the user ends up in the dashboard with their work intact.

---

## Acceptance criteria

### Trigger
- [ ] When the anonymous editor (`/editor`) has content (markdown is not empty) and the user clicks "Sign In", the current markdown string is captured before navigation
- [ ] The markdown is stored in `sessionStorage` under the key `pendingMigrationMarkdown` before redirecting to `/login`
- [ ] If the editor is empty, no migration is triggered (standard sign-in flow)

### Migration on sign-in
- [ ] After successful sign-in, `AuthModule` checks `sessionStorage` for `pendingMigrationMarkdown`
- [ ] If found: creates a new deck document in `decks` via `DeckRepository.createDeck` with:
  - `title`: `"Untitled Deck"` (user can rename later)
  - `markdown`: the captured content
  - `theme`: the theme selected in the anonymous editor (also stored in `sessionStorage` as `pendingMigrationTheme`)
  - `visibility`: `'unlisted'`
  - All other fields at their defaults
- [ ] After creating the deck, clears `sessionStorage` keys
- [ ] Redirects to the editor for the newly created deck (`/[username]/[deckSlug]/edit`) — if username is not yet set, redirect to `/dashboard` instead (username is set on first publish in #13)
- [ ] If deck creation fails (e.g. free tier already at limit — edge case for returning users), shows an error snackbar and redirects to `/dashboard` without losing the markdown (leave it in `sessionStorage` for a retry)

### No migration case
- [ ] If `sessionStorage` has no pending markdown, sign-in proceeds normally to `/dashboard`
- [ ] Migration only runs once: if the user signs in without having visited `/editor` first, nothing happens

### Username not yet set
- [ ] Deck creation can happen before the user has a `username` (it's set during first publish)
- [ ] `DeckRepository.createDeck` works with `username: null` — the deck is accessible via its `deckId` until a username is set
- [ ] Dashboard shows the deck card even without a public URL

### Tests
- [ ] Jest unit (AuthModule): simulate sign-in with `sessionStorage.pendingMigrationMarkdown = '# Hello'` → assert `DeckRepository.createDeck` called with the correct markdown → assert `sessionStorage` cleared after
- [ ] Jest unit: simulate sign-in with empty `sessionStorage` → assert `DeckRepository.createDeck` NOT called
- [ ] Playwright (emulator): open `/editor` → type markdown → click "Sign In" → complete sign-in → assert new deck exists in Firestore with the typed markdown content → assert `sessionStorage` is empty

---

## Implementation notes

- **`sessionStorage` vs. `localStorage`:** Use `sessionStorage` so the pending markdown is cleared automatically when the browser tab is closed. If the user opens a new tab to sign in, the migration won't apply — acceptable edge case at MVP.
- **Theme capture:** Store the selected theme name alongside the markdown in `sessionStorage` as `pendingMigrationTheme`. Default to `'default'` if not present.
- **`DeckRepository` dependency:** This slice requires `DeckRepository.createDeck` to exist. If #11 (Dashboard + CRUD) is not yet merged, stub `createDeck` for this slice's tests.
- **Ordering with `AuthContext`:** Place the migration check inside the `onAuthStateChanged` handler in `AuthContext`, after the user document creation logic from #08. Run migration only when `user` changes from `null` to a non-null value (first sign-in event).
