# 10 — App Navigation Bar

**Group:** C – Logged-In User
**Type:** AFK
**Blocked by:** #08 Authentication

---

## What to build

A consistent top navigation bar rendered on all logged-in pages: Dashboard, Editor, Settings. Shows the logo, primary nav links, and an avatar dropdown with profile/settings/sign-out actions. Also handles the "best viewed on desktop" mobile message for the editor route.

---

## Acceptance criteria

### Layout (56px tall, white background, `border-b border-neutral-200`)
- [ ] **Left:** mark-deck logo (text or SVG) — clicking navigates to `/dashboard`
- [ ] **Center:** "Dashboard" link — active state underlined with `#6366F1` when on `/dashboard`
- [ ] **Right:** "+ New Deck" button (MUI `Button variant="contained"` with `#6366F1`) + avatar dropdown

### Avatar dropdown
- [ ] Shows user avatar (circular, 36px) — same logic as #05 (Google photo or initials fallback)
- [ ] Clicking avatar opens a MUI `Menu` anchored to the avatar
- [ ] Menu items:
  - "My Profile" → `/[username]` (only shown if username is set; otherwise "Profile (not set yet)")
  - "Settings" → `/settings`
  - Divider
  - "Sign out" → calls `signOut()` from `AuthContext`, redirects to `/`
- [ ] Menu closes on outside click

### "+ New Deck" button
- [ ] Clicking opens the "New Deck" modal (title input) — modal implemented in #11
- [ ] Until #11 is merged, clicking navigates to `/dashboard` as a placeholder

### Logged-out state
- [ ] On public pages (`/`, `/[username]`, `/[username]/[deckSlug]`), the nav bar shows only the logo and a "Sign In" link (no avatar, no "+ New Deck")
- [ ] The logged-out nav bar is a simpler variant — consider a shared `<Header>` component with a `variant="public" | "app"` prop

### Mobile
- [ ] On viewports < 768px, the center nav links are hidden (logo + avatar only visible)
- [ ] Editor route shows "best viewed on desktop" overlay on small screens (already in #03; nav bar should still render)

### Tests
- [ ] Playwright: sign in → assert nav bar visible with avatar → click avatar → assert menu items visible → click "Sign out" → assert redirected to `/`
- [ ] Playwright: sign in with a user that has `username: 'johndoe'` → click avatar → click "My Profile" → assert navigates to `/johndoe`
- [ ] Playwright: sign in with a user that has `username: null` → click avatar → assert "Profile (not set yet)" shown and is not a link

---

## Implementation notes

- **Shared layout:** Place the nav bar in `app/(app)/layout.tsx` (a route group for auth-required pages). Public pages use a separate layout. This avoids prop-drilling auth state into every page.
- **Route group structure:**
  ```
  app/
    (public)/          # landing, login, [username], waitlist — no auth guard
      layout.tsx       # public nav bar
    (app)/             # dashboard, settings, editor — auth guard applied
      layout.tsx       # app nav bar + AuthGuard
  ```
- **Avatar initials component:** Extract `<UserAvatar user={user} size={36} />` as a shared component used in both nav bar and profile pages (#05). Reuse the color palette logic from #05.
