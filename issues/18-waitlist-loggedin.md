# 18 — Waitlist – Logged-In One-Click Join

**Group:** C – Logged-In User
**Type:** AFK
**Blocked by:** #07 Waitlist Anonymous, #08 Authentication

---

## What to build

Upgrade the `/waitlist` page for authenticated users: instead of an email input form, show the user's email pre-filled with a single confirm button. Uses the same `WaitlistModule.joinWaitlist()` function from #07, but passes the authenticated `userId`.

---

## Acceptance criteria

### Logged-in variant of `/waitlist`
- [ ] When `user != null` (authenticated), the page shows:
  - Headline and description (same as anonymous variant from #07)
  - User's email displayed as read-only text: *"We'll notify: {user.email}"*
  - Single CTA button: *"Join the waitlist"*
- [ ] Clicking the button calls `WaitlistModule.joinWaitlist(user.email, user.uid)`
- [ ] On success: replace button with confirmation: *"You're on the list! We'll email you when Pro launches."*
- [ ] On duplicate (already joined): show *"You're already on the list."*
- [ ] The anonymous email form (from #07) is hidden for authenticated users

### Limit Modal integration
- [ ] The **Limit Modal** (from #17) has a "Join the Pro waitlist" button → `/waitlist`
- [ ] When a logged-in user lands on `/waitlist` from the Limit Modal, they see the one-click variant — no extra steps

### Firestore write
- [ ] `WaitlistModule.joinWaitlist(email, userId)` — same function as #07 — writes `{ email, userId: string, createdAt }` to `waitlist/{email}` (using email as document ID)
- [ ] If document already exists (duplicate check via `setDoc` error), handle gracefully

### Tests
- [ ] Playwright (emulator): sign in → navigate to `/waitlist` → assert email shown as read-only → click "Join" → assert `waitlist/{email}` document in Firestore has `userId` set to the user's uid → assert confirmation shown
- [ ] Playwright: sign in → join waitlist → navigate to `/waitlist` again → assert "already on the list" message (document exists)
- [ ] Playwright: not signed in → navigate to `/waitlist` → assert email form shown (anonymous variant from #07)

---

## Implementation notes

- **Single page, two variants:** Use `const { user } = useAuth()` in the page component and conditionally render either the one-click or form variant. No separate routes needed.
- **`WaitlistModule` is shared:** `joinWaitlist` from #07 accepts `userId: string | null`. Pass `null` for anonymous, `user.uid` for authenticated. No duplication.
- **No auth guard:** `/waitlist` remains public — anonymous users can still access it. The variant is purely driven by auth state.
