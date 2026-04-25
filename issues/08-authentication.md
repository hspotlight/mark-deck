# 08 — Authentication – Login Page + AuthContext

**Group:** B – Auth Bridge
**Type:** AFK
**Blocked by:** #01 Project Scaffold

---

## What to build

A `/login` page with Google OAuth and Email/Password sign-in (toggle between sign-in and sign-up on the same page). `AuthContext` wraps the app and exposes the current user to all components. Successful sign-in redirects to `/dashboard`. Unauthenticated access to auth-gated routes redirects to `/login`.

---

## Acceptance criteria

### AuthContext
- [ ] `src/contexts/AuthContext.tsx` created
- [ ] Exposes: `user: FirebaseUser | null`, `loading: boolean`, `signInWithGoogle()`, `signInWithEmail(email, password)`, `signUpWithEmail(email, password)`, `signOut()`
- [ ] `loading: true` while Firebase resolves `onAuthStateChanged` on first load — prevents flash of unauthenticated UI
- [ ] `AuthContext` wraps the root layout in `app/layout.tsx`
- [ ] `useAuth()` hook exported for consuming components

### Login page (`/login`)
- [ ] Single page with a toggle: "Sign In" tab / "Sign Up" tab
- [ ] **Google sign-in:** MUI button with Google logo icon → calls `signInWithGoogle()` (Firebase `signInWithPopup` with `GoogleAuthProvider`)
- [ ] **Email/password form:**
  - Sign-in mode: email + password fields + "Sign In" submit
  - Sign-up mode: email + password + confirm password fields + "Create account" submit
  - Client-side validation: email format, password min 8 chars, passwords match (sign-up only)
- [ ] Submit button shows loading spinner while Firebase call is in flight
- [ ] Error messages shown below form (inline, not snackbar) for: wrong password, email already in use, user not found, weak password — using Firebase error codes
- [ ] "Forgot password?" link present in sign-in mode (calls `sendPasswordResetEmail`, shows confirmation message — no separate page needed)
- [ ] If user is already authenticated, redirect to `/dashboard` immediately (no login page shown)

### Post-sign-in redirect
- [ ] After successful sign-in or sign-up, redirect to `/dashboard`
- [ ] If the user was redirected to `/login` from a protected route (e.g. `/settings`), redirect back to that route after sign-in via a `?redirect=` query param

### Route protection
- [ ] `src/components/AuthGuard.tsx` created: wraps auth-required pages; redirects to `/login?redirect={currentPath}` if `user == null` and `loading == false`
- [ ] `AuthGuard` applied to: `/dashboard`, `/settings`, `/[username]/[deckSlug]/edit`
- [ ] While `loading == true`, show a centered full-page spinner (do not redirect prematurely)

### Firestore user document creation
- [ ] On first sign-in (user document does not exist in `users/{userId}`), create the user document with:
  - `displayName`: from Google profile or email prefix
  - `email`: from Firebase Auth
  - `avatarUrl`: Google photo URL or `null`
  - `bio`: `""`
  - `storageUsedBytes`: `0`
  - `createdAt`: `serverTimestamp()`
  - `username`: `null` (set during first publish — #13)
- [ ] On subsequent sign-ins, do not overwrite the existing document — use `setDoc` with `merge: true` but only update `displayName` and `avatarUrl`

### Sign out
- [ ] `signOut()` calls Firebase `signOut()` and redirects to `/`

### Tests
- [ ] Jest unit (AuthModule): mock `signInWithPopup` — verify that on first sign-in, user document is created in Firestore with correct fields; verify that on second sign-in, `username` field is not overwritten
- [ ] Jest unit: `signUpWithEmail` with mismatched passwords never calls Firebase (client-side guard)
- [ ] Playwright (emulator): navigate to `/dashboard` → assert redirect to `/login` → sign in via `signInWithCustomToken` test helper → assert redirect to `/dashboard`
- [ ] Playwright: sign in → sign out → assert redirected to `/` → assert `/dashboard` redirects to `/login`
- [ ] Playwright: sign in → navigate to `/login` → assert immediate redirect to `/dashboard`

---

## Implementation notes

- **Firebase emulator auth:** In E2E tests, use `connectAuthEmulator(auth, 'http://localhost:9099')` and create test users with `createUserWithEmailAndPassword` or `signInWithCustomToken`. No real Google OAuth needed.
- **`signInWithPopup` in emulator:** Google OAuth popup does not work in emulator. E2E tests should always use email/password or custom token. Google OAuth is tested manually.
- **Error code mapping:** Firebase error codes (e.g. `auth/wrong-password`, `auth/email-already-in-use`) should be mapped to human-readable strings in a `src/lib/authErrors.ts` lookup table.
- **`AuthGuard` pattern:** Implement as a wrapper component that reads `useAuth()` and renders `null` (or a spinner) while loading, redirects if no user, and renders `children` otherwise. Place it inside page components, not in `layout.tsx`, to keep the root layout lean.
- **Confirm password:** Only validate on the client; do not send confirm password to Firebase.
