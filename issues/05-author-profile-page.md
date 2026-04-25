# 05 — Author Profile Page

**Group:** A – Non-Login User
**Type:** AFK
**Blocked by:** #01 Project Scaffold

---

## What to build

A public SSR page at `/[username]` showing an author's profile header (avatar, display name, bio) and a grid of their public decks. Accessible to any visitor without signing in.

---

## Acceptance criteria

### Route & data fetching
- [ ] Route `/[username]` is a Next.js Server Component
- [ ] Fetches user document from Firestore by `username` field
- [ ] If `username` does not exist, renders the 404 page (#06)
- [ ] Fetches all decks for that user where `visibility == 'public'`, ordered by `publishedAt` descending

### Profile header
- [ ] **Avatar:** If `user.avatarUrl` is set (Google users), display it as a circular image (48px diameter)
- [ ] **Initials fallback:** If `avatarUrl` is null (email/password users), display a colored circle with the user's initials — color deterministically derived from the `userId` (e.g. `userId.charCodeAt(0) % palette.length`)
- [ ] **Display name** rendered as H1
- [ ] **Bio** rendered below display name (up to 1 line; truncate with ellipsis if longer); omitted if empty
- [ ] **Username handle** rendered as `@username` in secondary text color (`#475569`)

### Deck grid
- [ ] Grid of deck cards: 3 columns on desktop, 2 on tablet, 1 on mobile
- [ ] Each card shows: first-slide thumbnail (or placeholder icon if no `htmlUrl`), deck title, published date
- [ ] Clicking a card navigates to `/[username]/[deckSlug]`
- [ ] If the author has no public decks, show an empty state: "No public decks yet"

### Deck card thumbnail
- [ ] Thumbnail is a static `<img>` pointing to a `thumbnailUrl` field on the deck document (populated when the deck is exported in #14)
- [ ] If `thumbnailUrl` is null, show a placeholder with the deck's theme primary color as background + deck title text centered

### SEO
- [ ] `<title>`: `{displayName} (@{username}) — mark-deck`
- [ ] `og:title`, `og:description` set
- [ ] `og:image`: author avatar URL (or a static fallback)

### Tests
- [ ] Playwright (emulator): seed a user with 2 public decks and 1 private deck → navigate to `/[username]` → assert profile header shows correct display name and bio → assert exactly 2 deck cards shown (private deck excluded)
- [ ] Playwright: navigate to `/nonexistent-user` → assert 404 page
- [ ] Playwright: click a deck card → assert navigates to `/[username]/[deckSlug]`

---

## Implementation notes

- **Initials color palette:** Define a fixed array of 8 brand-consistent colors (e.g. shades of indigo, violet, blue). Use `userId.charCodeAt(0) % 8` to pick one. This is deterministic — same user always gets the same color.
- **`thumbnailUrl` field:** Add this field to the `decks` Firestore schema now even though it's populated in #14. Default to `null`.
- **Grid:** Use CSS Grid (`grid-cols-3`) + Tailwind responsive variants. Do not use MUI `Grid` for layout — Tailwind grid is simpler here.
- **Server Component:** All data fetching happens server-side. No `useEffect` needed.
