# 13 — Slug Management

**Group:** C – Logged-In User
**Type:** AFK
**Blocked by:** #12 Deck Editor – CodeMirror + Auto-Save

---

## What to build

Full slug lifecycle management in the editor: slug is auto-generated from the deck title on creation, editable before first publish, and locked permanently after first publish. Also handles the **username selection** flow (username is set once during first publish and forms the base of all public URLs).

---

## Acceptance criteria

### Slug display in editor
- [ ] Below the title/description fields, show: `mark-deck.com / {username} / {slug}` as a read-only URL preview
- [ ] If username is not yet set, show: `mark-deck.com / [choose username] / {slug}` with the username segment styled as a CTA
- [ ] If `publishedAt` is null (not yet published), the slug segment shows an editable MUI `TextField` (inline, compact)
- [ ] If `publishedAt` is set, the slug segment is plain text with a lock icon and a tooltip: *"Slug is locked to keep your shared links working"*

### Slug editing (pre-publish only)
- [ ] User can modify the slug in the inline field (lowercase, kebab-case enforced client-side: spaces → `-`, non-alphanumeric stripped)
- [ ] On blur or Enter, calls `SlugModule.ensureUniqueSlug` to validate uniqueness; if taken, appends `-2` (or next available) and updates the field
- [ ] Changes are saved to Firestore via `DeckRepository.updateDeck`
- [ ] `DeckRepository.updateDeck` rejects any attempt to change `slug` when `publishedAt != null` (server-side guard in addition to UI lock)

### Auto-slug on title change (pre-publish only)
- [ ] When the deck title changes AND `publishedAt` is null AND the user has not manually edited the slug, the slug auto-updates to match the new title (via `SlugModule.generateSlug`)
- [ ] Once the user manually edits the slug field, auto-update stops ("slug diverged from title" flag in `EditorContext`)

### Username selection (first publish flow)
- [ ] When the user clicks **Publish** for the first time and `user.username` is null, open a "Choose your username" dialog before proceeding with export
- [ ] Dialog: single input field, label "Your public handle", helper text *"This cannot be changed later. Your decks will live at mark-deck.com/[username]"*
- [ ] Validation: 3–20 chars, lowercase alphanumeric + hyphens only, no leading/trailing hyphen
- [ ] On submit: check `users` collection for uniqueness (query `where('username', '==', input)`) — if taken, show inline error *"This handle is already taken"*
- [ ] On unique: write `username` to `users/{userId}` document + update `username` field on all existing decks for this user (batch write)
- [ ] After username is set, continue with the publish flow (#14)

### Username permanence communication
- [ ] The dialog clearly states the username cannot be changed — bold, not just helper text
- [ ] After username is set, it never appears as editable anywhere in the UI

### Tests
- [ ] Jest unit (SlugModule): `generateSlug('Hello World! 2024')` → `'hello-world-2024'`; non-ASCII stripped; max 60 chars enforced
- [ ] Jest unit (SlugModule): `ensureUniqueSlug` — mock Firestore with existing `['my-deck', 'my-deck-2']` → `'my-deck'` input → returns `'my-deck-3'`
- [ ] Jest unit (DeckRepository): `updateDeck` with `slug` change on a published deck (has `publishedAt`) → throws error; on unpublished deck → succeeds
- [ ] Playwright (emulator): create deck → assert slug auto-generated from title → change title → assert slug updates → manually edit slug → change title again → assert slug no longer auto-updates → publish → assert slug field shows lock icon
- [ ] Playwright: first publish flow with no username → assert username dialog shown → enter username → submit → assert `users/{uid}.username` set in Firestore → assert slug locked

---

## Implementation notes

- **"Slug diverged" flag:** Store a boolean `slugEditedManually` in `EditorContext`. Set to `true` on the first user keypress in the slug field. Once true, title changes no longer auto-update the slug.
- **Batch username write:** When setting username, use a Firestore `writeBatch` to update `users/{uid}` and all `decks` documents for this user in one atomic operation. Query decks first, then batch-update.
- **Username uniqueness check timing:** Query Firestore on form submit (not on every keystroke) to avoid excessive reads. Show a spinner while checking.
- **URL preview formatting:** The URL preview is purely cosmetic — plain text + `TextField`. No actual URL navigation from clicking it.
- **`username` null state:** Until #13 lands, the URL preview in #12 can show a placeholder like `[username not set]`. This slice upgrades it.
