# 14 — Publish Flow – Export Cloud Function + Storage

**Group:** C – Logged-In User
**Type:** AFK
**Blocked by:** #12 Deck Editor, #13 Slug Management

---

## What to build

End-to-end publish flow: the editor's Publish button calls a Firebase Cloud Function that runs Marp CLI, produces PDF and HTML, uploads both to Firebase Storage, updates the deck Firestore document with export URLs and `publishedAt` timestamp, and generates a thumbnail. The public deck viewer (#04) and author profile grid (#05) become fully functional after this slice.

---

## Acceptance criteria

### Cloud Function (`functions/src/exportDeck.ts`)
- [ ] HTTP callable function named `exportDeck`
- [ ] **Input:** `{ deckId: string, markdown: string, theme: string, formats: ('pdf' | 'html')[] }`
- [ ] **Auth check:** reject with `unauthenticated` if `context.auth` is null
- [ ] **Owner check:** fetch deck from Firestore, reject with `permission-denied` if `deck.userId != context.auth.uid`
- [ ] **Storage quota check:** fetch `user.storageUsedBytes`; reject with `resource-exhausted` if adding estimated export size would exceed 50MB
- [ ] **Marp CLI execution:**
  - Install `@marp-team/marp-cli` in `functions/package.json`
  - Write markdown to a temp file (`/tmp/{deckId}.md`)
  - Run Marp CLI: `marp /tmp/{deckId}.md --pdf --output /tmp/{deckId}.pdf --theme {themeName}`
  - Run Marp CLI: `marp /tmp/{deckId}.md --html --output /tmp/{deckId}.html --theme {themeName}`
  - For branded themes, write the custom CSS to `/tmp/{theme}.css` and pass via `--theme /tmp/{theme}.css`
- [ ] **Upload to Storage:**
  - PDF → `exports/{userId}/{deckId}/deck.pdf`
  - HTML → `exports/{userId}/{deckId}/deck.html`
  - Both uploaded with `public` ACL (or via Storage download tokens — accessible without auth)
- [ ] **Thumbnail generation:**
  - Run `marp /tmp/{deckId}.md --image --output /tmp/{deckId}.png` (exports first slide as PNG)
  - Upload thumbnail → `exports/{userId}/{deckId}/thumbnail.png`
- [ ] **Firestore update (batch):**
  - `decks/{deckId}`: set `pdfUrl`, `htmlUrl`, `thumbnailUrl`, `publishedAt: serverTimestamp()` (only set `publishedAt` on first publish — use `merge: true` and only write `publishedAt` if currently null)
  - `users/{userId}`: increment `storageUsedBytes` by actual file sizes (sum of PDF + HTML + PNG bytes)
- [ ] **Output:** `{ pdfUrl: string, htmlUrl: string, thumbnailUrl: string }`
- [ ] **Error handling:** on any Marp CLI failure, clean up temp files and return `internal` error
- [ ] **Cloud Function config:** memory 512MB, timeout 60s

### Frontend – Publish button
- [ ] Publish button in editor header calls `httpsCallable(functions, 'exportDeck')` with `{ deckId, markdown, theme, formats: ['pdf', 'html'] }`
- [ ] While in flight: button shows spinner + disabled; status indicator in header shows *"Publishing..."*
- [ ] On success: show snackbar *"Published! Your deck is live."* + display the public URL below the header (copyable `<input readonly>` with a copy icon)
- [ ] On `unauthenticated`: redirect to `/login`
- [ ] On `resource-exhausted` (storage quota): show modal *"Storage full. Delete some images or decks to free up space."*
- [ ] On `internal`: show error snackbar *"Export failed. Please try again."*

### Frontend – Export PDF button
- [ ] Separate "Export PDF" button (outline) in editor header
- [ ] Calls `exportDeck` with `formats: ['pdf']` only
- [ ] On success: triggers browser download of `pdfUrl`
- [ ] Same loading/error handling as Publish

### Post-publish URL display
- [ ] After publish, the URL preview area (from #13) updates to show the live public URL as a clickable link + copy button
- [ ] "View live" link opens `/[username]/[deckSlug]` in a new tab

### Deck visibility on publish
- [ ] Publishing does not automatically change visibility — user controls that separately via the visibility dropdown (#12)
- [ ] If `visibility == 'private'` at time of publish, warn with a toast: *"Deck published but currently set to Private — only you can see it"*

### Tests
- [ ] Jest unit (ExportFunction): mock Marp CLI execution and Storage upload → assert Firestore batch write called with correct fields → assert temp files cleaned up on success and on error
- [ ] Jest unit: caller without auth → assert `unauthenticated` error thrown
- [ ] Jest unit: caller who is not deck owner → assert `permission-denied` thrown
- [ ] Playwright (emulator): sign in → create deck → open editor → write markdown → click Publish → wait → assert `decks/{deckId}` has `publishedAt` set in Firestore → assert `pdfUrl` and `htmlUrl` are non-null → assert public URL shown in editor
- [ ] Playwright: navigate to the public deck viewer URL → assert iframe loads the exported HTML → assert thumbnail appears in the deck card on dashboard

---

## Implementation notes

- **Marp CLI in Cloud Functions:** Marp CLI requires a Chromium instance for image export. Use `@marp-team/marp-cli` with `--allow-local-files` flag and ensure the Functions runtime has enough memory (512MB). Chromium is bundled with Marp CLI — no separate install needed.
- **Temp file cleanup:** Always clean up `/tmp` files in a `finally` block, even on error.
- **Storage public URLs:** Use Firebase Storage's `getDownloadURL` after upload to get the public URL. Alternatively, configure the bucket to allow public reads via Storage rules (already set in #01) and construct the URL directly — but `getDownloadURL` is safer.
- **`publishedAt` immutability:** On re-publish (user edits and publishes again), overwrite `pdfUrl`, `htmlUrl`, `thumbnailUrl` but do NOT overwrite `publishedAt`. Track first publish separately from latest export.
- **Emulator testing of Cloud Functions:** Use Firebase Emulator Functions emulator. Marp CLI will actually run inside it. Ensure the emulator image or test environment has Node 20 and can exec Marp CLI.
- **Theme CSS for branded themes:** Bundle the branded theme CSS files into the `functions/` directory so they're available at runtime. Copy them from `src/themes/` as part of the Functions build step.
