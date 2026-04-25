# 02 — Landing Page

**Group:** A – Non-Login User
**Type:** AFK
**Blocked by:** #01 Project Scaffold

---

## What to build

A static public landing page at `/` that communicates the product value proposition, drives anonymous users into the editor, and captures waitlist interest. No auth required.

---

## Acceptance criteria

### Content sections
- [ ] **Hero:** Headline, one-line subheading, two CTAs — "Start writing (no sign-up)" → `/editor` (anonymous) and "Join waitlist" → `/waitlist`
- [ ] **Feature highlights:** 3–4 short cards (split-panel editor, live Marp preview, one-click publish, shareable URL)
- [ ] **How it works:** 3-step visual (Write → Preview → Share)
- [ ] **Footer:** Logo, link to `/waitlist`, copyright

### Design
- [ ] Uses brand colors (`#6366F1` primary, `#F8FAFC` page background) and Inter typeface
- [ ] Primary CTA button: MUI `Button variant="contained"` with `#6366F1`, `disableElevation`
- [ ] Fully responsive (mobile + desktop)
- [ ] No broken links or console errors

### SEO
- [ ] `<title>` and `<meta name="description">` set via Next.js `metadata` export
- [ ] OG tags: `og:title`, `og:description`, `og:image` (static image for landing page)

### Performance
- [ ] Lighthouse performance score ≥ 90 on desktop (measured via `npm run e2e` Playwright audit or manual check)

### Tests
- [ ] Playwright: navigate to `/` → assert hero headline visible, CTA "Start writing" links to `/editor`
- [ ] Playwright: "Join waitlist" link navigates to `/waitlist`

---

## Implementation notes

- This is a React Server Component — no `"use client"` needed.
- Keep it a single `app/page.tsx` with inline section components — no need for separate files unless sections exceed ~80 lines.
- The anonymous editor route (`/editor`) is built in #03. Add the link now; it will 404 until #03 lands.
