# mark-deck — Product Design Document

> Tempo domain: `mark-deck.com`
> Last updated: 2026-04-25

---

## Pages

| Route | Auth | Description |
|-------|------|-------------|
| `/` | Public | Landing page |
| `/login` | Public | Sign in + Sign up (toggle on same page) |
| `/dashboard` | Required | Deck library grid |
| `/[username]` | Public | Author profile page |
| `/[username]/[deckSlug]` | Public | Public deck viewer |
| `/[username]/[deckSlug]/edit` | Required (owner) | Deck editor |
| `/settings` | Required | Profile (bio), storage usage, account |
| `/waitlist` | Public | Logged-in: one-click join (email pre-filled). Not logged-in: email input form. |
| `404` | Public | Not found — also shown for deleted deck URLs |

---

## Concept

SaaS for individual creators (instructors, educators) to write, preview, and publish Marp slide decks. Split-panel editor with live preview. One-click publish to a shareable public URL.

---

## Users & Auth

- **Target user:** Individual creators — instructors, educators, bloggers
- **Sign-in methods:** Google OAuth + Email/Password (Firebase Auth)
- **Anonymous access:** Users can write and preview without signing in. Sign-in required to save/publish.
- **Anonymous → permanent migration:** On sign-in, current markdown is preserved and saved as their first deck
- **Username:**
  - Set once during first publish flow ("Choose your public handle")
  - Permanent — cannot be changed
  - Forms the base of all public URLs

---

## Dashboard

- Grid of deck cards (first-slide thumbnail + title + last edited date)
- "Create new deck" as a `+` card in top-left of grid
- Free tier: max 1 deck. Attempting to create a 2nd shows a modal: *"You've reached the free plan limit. Pro coming soon — join the waitlist."*
- Deck context menu (`...`): **Rename**, **Duplicate**, **Delete**

---

## Editor

### Layout
- Split panel: markdown editor (left) + Marp live preview (right)
- Deck title input + optional description field above the panels
- Toolbar above editor: Theme dropdown | New Slide (`---`) | Bold | Italic | Image upload
- Auto-save to Firestore with status indicator in header: `Saving...` / `Saved ✓` / `Unsaved changes`

### URL structure
- Editing: `/[username]/[deckSlug]/edit`
- Slug auto-generated from title (e.g. "My React Talk" → `my-react-talk`)
- Slug is editable before first publish, locked after (tooltip: *"Slug is locked to keep your shared links working"*)

### Text Editor
- CodeMirror with standard Markdown syntax highlighting
- `---` slide separator visually emphasized (subtle full-width divider)
- Not a full IDE — clean, approachable UI

### Live Preview
- Rendered client-side using `@marp-team/marp-core`
- Debounced 500ms after last keystroke

### New Deck Flow
- Click "New Deck" → modal asks for title only → opens editor
- Theme selectable anytime in toolbar

---

## Themes

Selected via dropdown in toolbar.

### Marp Built-ins
| Name | Description |
|------|-------------|
| Default | Clean white, standard Marp default |
| Gaia | Dark background variant |
| Uncover | Minimal, centered layout |

### mark-deck Branded Themes

| Name | Mood / Use case | Background | Primary Text | Accent |
|------|----------------|------------|--------------|--------|
| **Professional** | Corporate presentations, business | `#FFFFFF` | `#1E293B` | `#6366F1` |
| **Academic** | Lectures, university, research | `#F8F7F4` | `#1A1A2E` | `#3B5BDB` |
| **Dark** | Tech talks, developer conferences | `#0F172A` | `#F1F5F9` | `#818CF8` |
| **Vibrant** | Workshops, energetic sessions | `#FAFAFA` | `#18181B` | `#7C3AED` |
| **Minimal** | Let content speak, no decoration | `#FFFFFF` | `#374151` | `#9CA3AF` |

Each branded theme is a custom Marp CSS file bundled with the app. Typography uses **Inter** (body) and **Inter** (headings) — system font stack fallback.

---

## Images

- Upload only (no URL paste)
- Stored in Firebase Storage
- **Per-file limit:** 5MB
- **Per-user quota:** 50MB total
- Storage usage bar shown in Settings page
- Inserted as `![](url)` into markdown at cursor position

---

## Publishing & Export

### Export flow
1. User clicks **Publish** or **Export**
2. Frontend calls a Firebase Cloud Function (HTTP callable)
3. Cloud Function runs Marp CLI → generates PDF and/or HTML
4. Output uploaded to Firebase Storage
5. Function returns public Storage URL
6. Frontend shows download link / updates published URL

### Export formats
- **PDF** — via Marp CLI
- **HTML** — via Marp CLI
- Both saved to Firebase Storage under the user's path

### Deck visibility (per-deck setting)
| Option | Behaviour |
|--------|-----------|
| `public` | Anyone can view, Google-indexable |
| `unlisted` (default) | Anyone with link can view, not indexed |
| `private` | Owner only |

### Published URL
```
/[username]/[deckSlug]
```

### Delete behaviour
- Hard delete: deck removed from Firestore + Storage immediately
- Published URL returns 404 instantly
- Confirmation modal shown before delete

---

## Public Deck Viewer (`/[username]/[deckSlug]`)

- App-branded page (not raw Firebase Storage HTML)
- Centered iframe embedding the exported HTML from Firebase Storage
- Marp slide navigation (arrow keys) works inside iframe
- Metadata shown: title, author name (links to profile), published date, view count, download count, deck description
- Social share buttons (Twitter/X, copy link)
- Download button (PDF) — increments download counter on click
- Fully mobile-responsive
- View counter incremented on each page load (Firestore)

---

## Author Profile Page (`/[username]`)

- Profile header: avatar (Google photo or colored initials fallback) + display name + optional one-line bio
- Grid of public decks below
- Bio editable in Settings; avatar auto-pulled from Google (not uploadable)

---

## Navigation (logged-in)

```
[Logo]  [Dashboard]  [+ New Deck]              [Avatar ▾]
                                        Profile | Settings | Sign out
```

---

## Open Graph / Social Preview

- Public deck pages generate a dynamic OG image using Next.js `ImageResponse`
- OG image = first slide rendered as image
- Appears in Twitter/Slack/WhatsApp link previews

---

## Monetization

- **MVP:** Free only
- **Free tier limits:**
  - 1 deck max
  - 50MB storage
  - Marp built-in themes only
  - PDF export only
- **Pro plan:** Coming soon — email waitlist CTA shown in limit modals and settings

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js (App Router) |
| Hosting | Firebase App Hosting (GitHub-linked) |
| Auth | Firebase Authentication |
| Database | Firebase Firestore |
| Storage | Firebase Storage |
| Functions | Firebase Cloud Functions |
| Markdown editor | CodeMirror |
| Marp (preview) | `@marp-team/marp-core` (client-side) |
| Marp (export) | Marp CLI (Cloud Function) |
| UI components | MUI (Material UI) |
| Styling | Tailwind CSS + MUI (StyledEngineProvider for CSS order) |
| State management | React Context (`AuthContext`, `EditorContext`) |
| Analytics | Firebase Analytics |

---

## Mobile

- **Editor:** Desktop only. Show "best viewed on desktop" message on small screens.
- **Public deck viewer:** Fully mobile-responsive.
- **Dashboard/profile:** Responsive.

---

## Testing

- **Unit tests:** Mock Firebase Auth via Jest. Components tested in isolation.
- **E2E tests:** Firebase Emulator Suite (Auth + Firestore + Storage). Test users created via `signInWithCustomToken()` — no real Google OAuth needed.

---

## Analytics & Metrics

- **Product analytics:** Firebase Analytics (page views, user flows, funnel)
- **Per-deck metrics (owner-visible):**
  - View count (incremented on public page load)
  - Download count (incremented on PDF download click)
- **No email notifications at MVP** — all feedback is in-app

---

## Admin

- No custom admin panel at MVP
- Use Firebase Console directly (Auth, Firestore, Storage)

---

## Discovery

- No explore/gallery page at MVP
- Public decks are indexable by Google via SSR (`/[username]/[deckSlug]`)
- Discovery deferred to v2

---

## Design System

### Brand Colors

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#6366F1` | Buttons, links, active states, accent |
| `primary-dark` | `#4F46E5` | Hover state for primary |
| `primary-light` | `#EEF2FF` | Backgrounds, chips, subtle highlights |
| `neutral-50` | `#F8FAFC` | Page backgrounds |
| `neutral-100` | `#F1F5F9` | Card backgrounds, input fills |
| `neutral-300` | `#CBD5E1` | Borders, dividers |
| `neutral-600` | `#475569` | Secondary text, placeholders |
| `neutral-900` | `#0F172A` | Primary text, headings |
| `success` | `#10B981` | Saved indicator, success states |
| `warning` | `#F59E0B` | Unsaved changes indicator |
| `error` | `#EF4444` | Errors, delete confirmations |
| `white` | `#FFFFFF` | Surfaces, editor background |

### Typography

| Role | Font | Weight | Size |
|------|------|--------|------|
| Heading 1 | Inter | 700 | 2rem |
| Heading 2 | Inter | 600 | 1.5rem |
| Heading 3 | Inter | 600 | 1.25rem |
| Body | Inter | 400 | 1rem |
| Small / caption | Inter | 400 | 0.875rem |
| Code / editor | JetBrains Mono | 400 | 0.9rem |

### Spacing & Shape

- **Base unit:** 4px (Tailwind default)
- **Border radius:** `rounded-lg` (8px) for cards and modals, `rounded-md` (6px) for buttons and inputs
- **Card shadow:** `shadow-sm` — subtle, not dramatic
- **Editor split:** 50/50 default, no resize handle at MVP

### Component Conventions (MUI overrides)

- All MUI buttons use `disableElevation` — flat style, no drop shadow
- Primary button: `variant="contained"` with `#6366F1` background
- Secondary button: `variant="outlined"` with `#6366F1` border
- Modals: MUI `Dialog` with `rounded-lg` paper override
- Toasts/snackbars: bottom-center, auto-dismiss 3s
- Toolbar: white background, `border-b border-neutral-200`, height `48px`
- Header: white background, `border-b border-neutral-200`, height `56px`

### Editor UI

- Editor background: `#FFFFFF`
- Editor font: JetBrains Mono, 14px, line-height 1.6
- Slide separator `---` rendered as a full-width `#E2E8F0` horizontal rule in CodeMirror
- Preview panel background: `#F8FAFC` (slightly off-white to distinguish from editor)
- Split divider: 1px `#E2E8F0`

---

## Out of Scope for MVP

- Team collaboration / shared decks
- Real-time co-editing
- Custom avatar upload
- Email notifications
- Admin dashboard
- GitHub OAuth
- Public deck gallery
- Stripe billing
- Custom domain for published decks
- Deck description is optional (can be empty)
