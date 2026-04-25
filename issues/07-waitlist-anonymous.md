# 07 — Waitlist Page – Anonymous Email Form

**Group:** A – Non-Login User
**Type:** AFK
**Blocked by:** #01 Project Scaffold

---

## What to build

A public page at `/waitlist` where any visitor can enter their email to join the Pro waitlist. Writes an email + null userId to the `waitlist` Firestore collection. The logged-in version (one-click join) is built in #18.

---

## Acceptance criteria

### Route & layout
- [ ] `/waitlist` renders for unauthenticated users — no redirect
- [ ] If a user is already signed in, show the one-click version (built in #18); until #18 lands, show the email form for all users

### Page content
- [ ] Headline: e.g. *"Pro is coming — be the first to know"*
- [ ] Short description: 1–2 sentences about what Pro will include (more decks, custom themes, HTML export)
- [ ] Email input field (required, basic format validation client-side)
- [ ] Submit button: "Join the waitlist"

### Submission flow
- [ ] On submit, writes `{ email: string, userId: null, createdAt: serverTimestamp() }` to `waitlist` Firestore collection
- [ ] On success: input replaced with a confirmation message *"You're on the list! We'll email you when Pro launches."*
- [ ] On duplicate email (Firestore unique constraint via security rules or application logic): show *"You're already on the list."*
- [ ] On error: show generic error snackbar *"Something went wrong. Please try again."*
- [ ] Submit button shows a loading spinner while the Firestore write is in flight

### Validation
- [ ] Empty submission blocked — browser native `required` + client-side check
- [ ] Invalid email format (no `@`) blocked client-side before write

### Firestore security rules
- [ ] `waitlist` collection: write allowed for all (authenticated and unauthenticated); no client reads allowed (already defined in #01 rules, verified here)

### Tests
- [ ] Playwright (emulator): navigate to `/waitlist` → enter a valid email → submit → assert confirmation message shown → assert document exists in emulated Firestore `waitlist` collection with correct email
- [ ] Playwright: submit with invalid email format → assert form does not submit, error message shown
- [ ] Playwright: submit empty form → assert blocked

---

## Implementation notes

- **Duplicate detection:** Firestore does not enforce unique email natively. Options: (a) query `waitlist` for the email before writing (acceptable at MVP scale), or (b) use the email as the document ID (`waitlist/{email}`) and use `setDoc` with `merge: false` — if document exists, catch the error. Option (b) is simpler and atomic.
- **Client component:** The form requires state (input value, loading, success) so this is a `"use client"` component.
- **WaitlistModule:** Create `src/modules/waitlist.ts` with a `joinWaitlist(email: string, userId: string | null)` function. Both this page and the logged-in version (#18) call the same function.
