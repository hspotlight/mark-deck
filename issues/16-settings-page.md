# 16 — Settings Page

**Group:** C – Logged-In User
**Type:** AFK
**Blocked by:** #08 Authentication

---

## What to build

A `/settings` page where logged-in users can edit their bio, view storage usage, and see their account details (email, sign-in method). Three distinct sections on a single page.

---

## Acceptance criteria

### Route
- [ ] `/settings` is auth-gated via `AuthGuard`
- [ ] Accessible from the avatar dropdown menu (#10)

### Section 1: Profile
- [ ] **Display name:** read-only (pulled from Firebase Auth `displayName`); not editable at MVP (determined by Google profile or sign-up name)
- [ ] **Username:** read-only if set, shown as `@{username}`; if not yet set, show *"Set when you first publish a deck"*
- [ ] **Bio:** MUI `TextField` multiline, max 160 chars, character counter shown; pre-filled with `user.bio` from Firestore
- [ ] Save button: MUI `Button variant="contained"`; on click calls `updateDoc(users/{uid}, { bio })` → shows success snackbar *"Profile updated"*
- [ ] Save button disabled if bio hasn't changed from its loaded value

### Section 2: Storage
- [ ] Heading: "Storage"
- [ ] Usage display: `{usedMB} MB of 50 MB used` (reads `storageUsedBytes` from `AuthContext` / Firestore)
- [ ] MUI `LinearProgress` bar: `value={(storageUsedBytes / 50MB) * 100}`, color `#6366F1`; turns `error` red when > 90% full
- [ ] If at 100%: warning message *"Storage full — delete unused images to free up space"*
- [ ] Note below bar: *"Includes uploaded images and exported deck files"*

### Section 3: Account
- [ ] **Email:** display `user.email` (read-only)
- [ ] **Sign-in method:** display "Google" or "Email & Password" (derived from `user.providerData[0].providerId`)
- [ ] **Danger zone:** "Delete Account" button — at MVP, clicking shows a modal: *"To delete your account, please contact support."* (no self-serve deletion at MVP)

### Layout
- [ ] Single-column layout, max-width 640px, centered
- [ ] Sections separated by `<Divider>` with section headings as MUI `Typography variant="h6"`
- [ ] Fully responsive

### Tests
- [ ] Playwright (emulator): sign in → navigate to `/settings` → assert email shown correctly → edit bio → save → assert `users/{uid}.bio` updated in Firestore → assert success snackbar shown
- [ ] Playwright: navigate to `/settings` without auth → assert redirect to `/login`
- [ ] Playwright: assert storage bar shows correct percentage for a user with 25MB used (50% bar)

---

## Implementation notes

- **`storageUsedBytes` source:** Read from `AuthContext` (which subscribes to `users/{uid}` via `onSnapshot` in #15). Do not add a separate Firestore read in this page.
- **Bio char counter:** `{bio.length} / 160` shown below the textarea, updated in real-time as user types.
- **Sign-in method detection:** `user.providerData` is an array of `UserInfo` objects. Check `providerData[0].providerId`: `'google.com'` → "Google", `'password'` → "Email & Password".
- **No password change at MVP:** Email/password users cannot change their password from settings — they can use "Forgot password?" from the login page.
