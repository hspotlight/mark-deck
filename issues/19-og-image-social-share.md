# 19 — OG Image Generation + Social Share

**Group:** C – Logged-In User
**Type:** AFK
**Blocked by:** #14 Publish Flow

---

## What to build

Dynamic Open Graph image for each public deck page, generated using Next.js `ImageResponse` and the deck's first slide content. Completes the social share buttons (Twitter/X, copy link) on the public deck viewer. When a deck link is shared on Twitter, Slack, or WhatsApp, a rich preview card appears with the first slide as the image.

---

## Acceptance criteria

### OG image route
- [ ] Route: `app/[username]/[deckSlug]/opengraph-image.tsx` using Next.js `ImageResponse`
- [ ] Fetches the deck's `htmlUrl` from Firestore (server-side)
- [ ] Renders the first slide as a 1200×630px PNG image
- [ ] **First slide extraction:** fetch the exported HTML from `htmlUrl` (Firebase Storage), parse out the first `<section>` element (Marp renders each slide as a `<section>`), render it inside `ImageResponse` using its inline styles
- [ ] If `htmlUrl` is null or fetch fails, render a fallback OG image: mark-deck logo centered on `#6366F1` background with deck title text
- [ ] Image response has cache headers: `max-age=3600` (1 hour) — re-generated on each CDN miss

### Public deck viewer (`/[username]/[deckSlug]`) — OG meta tags
- [ ] `generateMetadata` in the page already sets `og:image` to the `/opengraph-image` route (placeholder set in #04)
- [ ] Verify the OG image URL resolves correctly in production (absolute URL, not relative)
- [ ] `og:image:width`: 1200, `og:image:height`: 630 set in metadata

### Social share buttons (upgrade from #04 placeholder)
- [ ] **Twitter/X:** `https://twitter.com/intent/tweet?url={encodedUrl}&text={encodedTitle}+by+{encodedAuthor}` — opens in new tab
- [ ] **Copy link:** copies `https://mark-deck.com/[username]/[deckSlug]` to clipboard; shows *"Link copied!"* snackbar
- [ ] Both buttons styled as MUI `Button variant="outlined"` with icon (Twitter bird SVG, copy icon from MUI Icons)

### Tests
- [ ] Playwright: publish a deck → share on Twitter button → assert correct tweet URL opened (check `window.open` call via Playwright intercept)
- [ ] Playwright: copy link button → assert clipboard content matches expected URL
- [ ] Manual: paste the deck URL into the Twitter card validator (or `opengraph.xyz`) and verify the OG image renders as the first slide — document this as a manual acceptance test

---

## Implementation notes

- **First slide HTML extraction:** The Marp HTML output wraps slides in `<section>` tags. Use a regex or lightweight HTML parser (`node-html-parser` at 0 dependencies) to extract the first `<section>` and its inline `<style>` from the document. Do NOT use full DOM parsing in a Next.js Edge runtime — keep it lightweight.
- **`ImageResponse` with Marp HTML:** `ImageResponse` renders JSX, not raw HTML. Convert the first slide's content to a simplified JSX representation — or render the slide title and theme color as a styled card if full HTML rendering is too complex. Full pixel-perfect replication of the slide is not required; a clear, branded representation of the slide is sufficient.
- **Absolute OG image URL:** In `generateMetadata`, construct the OG image URL using the `NEXT_PUBLIC_BASE_URL` env var (e.g. `https://mark-deck.com`) to ensure an absolute URL in production.
- **Edge runtime:** `opengraph-image.tsx` should use `export const runtime = 'edge'` for fast response times globally.
- **Fallback quality:** The fallback OG image (logo on `#6366F1` background) should look polished — it appears any time a deck hasn't been exported yet or the export fails to load.
