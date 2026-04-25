# 04 — Public Deck Viewer

**Group:** A – Non-Login User
**Type:** AFK
**Blocked by:** #01 Project Scaffold
**Soft dependency:** #14 Publish Flow (needed for real exported HTML; use seeded fixture data during development)

---

## What to build

An SSR page at `/[username]/[deckSlug]` that any visitor can view without signing in. Fetches deck metadata from Firestore server-side (for SEO), embeds the exported HTML in a sandboxed iframe (for slide navigation), shows author metadata and deck stats, and provides a PDF download button. View count increments on every page load client-side.

---

## Acceptance criteria

### Route & data fetching
- [ ] Route `/[username]/[deckSlug]` is a Next.js Server Component using `generateMetadata` for per-page SEO
- [ ] Fetches deck document from Firestore by joining `username` → `userId` → `decks` where `slug == deckSlug`
- [ ] If deck does not exist, or `visibility == 'private'`, renders the 404 page (built in #06)
- [ ] If `visibility == 'unlisted'`, page renders normally but is excluded from `robots.txt` sitemap (add `noindex` meta tag)
- [ ] If `visibility == 'public'`, page is fully indexable

### SEO metadata
- [ ] `<title>`: `{deck.title} — {author.displayName}`
- [ ] `<meta name="description">`: `deck.description` (or fallback to first 160 chars of markdown stripped of markdown syntax)
- [ ] `og:title`, `og:description`, `og:image` → `/[username]/[deckSlug]/opengraph-image` (OG image built in #19; use a static fallback until then)
- [ ] `og:type`: `website`
- [ ] Canonical URL set

### Slide iframe
- [ ] `htmlUrl` from the deck's Firestore document is embedded in a `<iframe src={htmlUrl} sandbox="allow-scripts" />`
- [ ] iframe is centered, fills the main content area, 16:9 aspect ratio maintained with CSS (`aspect-ratio: 16/9`)
- [ ] Marp slide navigation (arrow keys, spacebar) works inside iframe — Marp's own JS handles this inside the sandboxed document
- [ ] If `htmlUrl` is null (deck not yet published), show a "This deck hasn't been published yet" placeholder instead of iframe

### Metadata panel
- [ ] Deck title (H1)
- [ ] Author avatar + display name — clicking name navigates to `/[username]`
- [ ] Published date (formatted as "Apr 25, 2026")
- [ ] Deck description (if present)
- [ ] View count and download count displayed (e.g. "142 views · 18 downloads")

### Download button
- [ ] "Download PDF" button links to `deck.pdfUrl` with `download` attribute
- [ ] Clicking button triggers `DeckRepository.incrementDownloadCount(deckId)` client-side (fire-and-forget)
- [ ] If `pdfUrl` is null, button is disabled with tooltip "PDF not yet available"

### Social share
- [ ] "Share on Twitter/X" button opens `https://twitter.com/intent/tweet?url=...&text=...` in a new tab (placeholder for #19)
- [ ] "Copy link" button copies the current URL to clipboard; shows a "Copied!" snackbar (3s, bottom-center)

### View counter
- [ ] On client mount, calls `DeckRepository.incrementViewCount(deckId)` once per page load (fire-and-forget, no await)
- [ ] Does not block rendering or show any loading state

### Mobile responsiveness
- [ ] Layout is fully responsive — iframe scales down on small screens maintaining 16:9
- [ ] Metadata panel stacks vertically below iframe on mobile
- [ ] Download and share buttons remain accessible on mobile

### Tests
- [ ] Playwright (emulator): seed a deck with `visibility: 'public'` and an `htmlUrl` pointing to a fixture HTML in emulated Storage → navigate to `/[username]/[deckSlug]` → assert title visible, iframe present, view count in Firestore incremented by 1
- [ ] Playwright: navigate to a non-existent slug → assert 404 page shown
- [ ] Playwright: seed a `private` deck → navigate to its URL → assert 404 page shown
- [ ] Playwright: click "Copy link" → assert clipboard contains the correct URL (Playwright clipboard API)

---

## Implementation notes

- **Firestore query pattern:** `users` collection doesn't have a `username` index by default. Query: `collection('users').where('username', '==', username).limit(1)` — add a Firestore index for `users.username`.
- **View count:** Use `FieldValue.increment(1)` in a `updateDoc` call. Do not read-then-write.
- **SSR + client split:** The page component is a Server Component. The view counter increment and copy-link button are in a small `"use client"` child component (`<DeckActions />`).
- **Fixture data for dev:** `firebase/seed.ts` (from #01) should include at least one published deck with a real `htmlUrl` pointing to a fixture HTML file in emulated Storage.
- **iframe HTML source:** The exported HTML from Marp CLI is a complete standalone document with Marp CSS inlined. It does not require any external resources, so `sandbox="allow-scripts"` is sufficient.
