# 17 — Free Tier Limit Enforcement

**Group:** C – Logged-In User
**Type:** AFK
**Blocked by:** #11 Dashboard + Deck CRUD

---

## What to build

Hard enforcement of the free tier limits: max 1 deck and 50MB storage. Shows a consistent "limit reached" modal with a Pro waitlist CTA whenever a user hits a cap. Enforced both client-side (for UX) and server-side (via `DeckRepository` and Cloud Function) so limits cannot be bypassed.

---

## Acceptance criteria

### Deck limit (max 1 deck)

**Client-side:**
- [ ] When user has ≥ 1 deck and clicks "+ New Deck", show the **Limit Modal** instead of the new deck modal
- [ ] When user has ≥ 1 deck and clicks "Duplicate" in the context menu, show the **Limit Modal**
- [ ] Check is based on the real-time deck count from `listDecks` (already in memory from the dashboard listener)

**Server-side:**
- [ ] `DeckRepository.createDeck` counts existing decks for the user before writing; throws `FREE_TIER_LIMIT` if count ≥ 1
- [ ] This guard already exists from #11 — verify it's tested and wire the error to the Limit Modal

### Storage limit (50MB)

**Client-side:**
- [ ] Image upload blocked client-side when `storageUsedBytes + file.size > 50MB` (already in #15 — verified here)
- [ ] Export/Publish blocked client-side when `storageUsedBytes > 45MB` (warn: close to limit) or when Cloud Function returns `resource-exhausted`

**Server-side:**
- [ ] Cloud Function `exportDeck` checks storage quota before running Marp CLI (already in #14 — verified here)

### Limit Modal (reusable component)
- [ ] MUI `Dialog` component: `<LimitModal open={...} onClose={...} reason={'deck' | 'storage'} />`
- [ ] **Deck limit variant:**
  - Title: *"You've reached the free plan limit"*
  - Body: *"The free plan includes 1 deck. Upgrade to Pro for unlimited decks, more storage, and custom themes."*
  - CTA button: *"Join the Pro waitlist"* → navigates to `/waitlist`
  - Secondary: *"Maybe later"* → closes modal
- [ ] **Storage limit variant:**
  - Title: *"Storage full"*
  - Body: *"You've used your 50MB of free storage. Delete unused images or decks to free up space, or upgrade to Pro."*
  - CTA: *"Join the Pro waitlist"* → `/waitlist`
  - Secondary: *"Manage storage"* → `/settings`
- [ ] Modal is dismissable (Escape key, clicking backdrop, "Maybe later")

### Surfacing points
- [ ] Dashboard: "+ New Deck" card (deck limit)
- [ ] Dashboard: Duplicate in context menu (deck limit)
- [ ] Editor toolbar: image upload button (storage limit — shows modal instead of snackbar if `storageUsedBytes >= 50MB`)
- [ ] Editor header: Publish button — if Cloud Function returns `resource-exhausted`, show storage limit modal

### Tests
- [ ] Jest unit (DeckRepository): assert `createDeck` throws `FREE_TIER_LIMIT` when user has 1 deck; succeeds with 0 decks (already in #11, confirmed passing)
- [ ] Playwright (emulator): create 1 deck → click "+ New Deck" → assert Limit Modal shown with deck limit messaging → click "Join the Pro waitlist" → assert navigated to `/waitlist`
- [ ] Playwright: duplicate existing deck when at limit → assert Limit Modal shown
- [ ] Playwright: simulate user at 49.5MB storage → attempt image upload of 1MB file → assert storage limit modal shown

---

## Implementation notes

- **`LimitModal` as a shared component:** Place in `src/components/LimitModal.tsx`. Import it wherever limits need to be communicated — dashboard, editor, etc.
- **Client-side deck count:** The dashboard already has the deck list in state from the real-time listener. Use `decks.length >= 1` — no extra Firestore read needed.
- **Storage limit check granularity:** The 50MB client-side check is an approximation (uses the `storageUsedBytes` from `AuthContext`). The server-side check in the Cloud Function is the authoritative guard.
- **`resource-exhausted` error from Cloud Function:** This is a Firebase Functions error code (`functions/resource-exhausted`). Map it to the storage limit modal in the Publish button error handler.
