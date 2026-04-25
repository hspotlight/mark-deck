# 20 — Analytics Integration

**Group:** C – Logged-In User (but covers all users)
**Type:** AFK
**Blocked by:** #01 Project Scaffold

---

## What to build

Firebase Analytics integrated across all pages to track page views and key product funnel events. Enables data-driven decisions about which features drive sign-ups, retention, and waitlist conversions without requiring any third-party analytics service.

---

## Acceptance criteria

### Firebase Analytics initialization
- [ ] `analytics` initialized in `src/lib/firebase.ts` using `getAnalytics(app)` — guarded with `typeof window !== 'undefined'` (Analytics is browser-only, not SSR-compatible)
- [ ] `src/lib/analytics.ts` created: exports a typed `logEvent` wrapper that calls `logEvent(analytics, eventName, params)` — no raw Firebase Analytics calls in component files

### Page view tracking
- [ ] Automatic page views enabled via `logEvent(analytics, 'page_view')` in the root layout using Next.js `usePathname()` hook — fires on every client-side navigation
- [ ] Page views tracked for: `/`, `/login`, `/dashboard`, `/editor`, `/[username]/[deckSlug]`, `/[username]`, `/settings`, `/waitlist`

### Funnel events
Track these named events with the `logEvent` wrapper:

| Event name | Fired when | Parameters |
|---|---|---|
| `sign_up` | User completes sign-up (first auth) | `{ method: 'google' \| 'email' }` |
| `sign_in` | User signs in (returning) | `{ method: 'google' \| 'email' }` |
| `deck_created` | New deck created | `{ theme: string }` |
| `deck_published` | Publish button succeeds | `{ theme: string, visibility: string }` |
| `deck_exported_pdf` | Export PDF button succeeds | — |
| `deck_deleted` | Deck deleted | — |
| `image_uploaded` | Image uploaded successfully | `{ file_size_kb: number }` |
| `waitlist_joined` | Waitlist form submitted | `{ method: 'one_click' \| 'email_form' }` |
| `free_tier_limit_shown` | Limit Modal shown | `{ reason: 'deck' \| 'storage' }` |
| `username_set` | Username set for first time | — |
| `theme_changed` | Theme picker changed in editor | `{ theme: string }` |

### Per-deck metrics (already in #04)
- [ ] View count and download count increments in Firestore (already in #04, #14) — these are product metrics separate from Analytics; confirm they are still being incremented correctly

### Privacy
- [ ] No PII logged to Analytics — no email addresses, no user IDs, no deck content
- [ ] Analytics disabled if `NEXT_PUBLIC_ANALYTICS_ENABLED=false` env var is set (used in tests to prevent emitting events during E2E runs)

### Tests
- [ ] Jest unit: mock `logEvent` → trigger `deck_created` action → assert `logEvent` called with correct event name and params
- [ ] Jest unit: simulate Analytics disabled via env var → assert `logEvent` wrapper is a no-op
- [ ] No E2E tests for Analytics (Firebase Analytics does not have an emulator) — unit tests are sufficient

---

## Implementation notes

- **SSR guard:** `getAnalytics` throws if called server-side. Wrap with `if (typeof window !== 'undefined')` or use a `useEffect` to initialize on the client only.
- **`analytics.ts` wrapper pattern:**
  ```ts
  export function trackEvent(name: string, params?: Record<string, unknown>) {
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'false') return;
    if (typeof window === 'undefined') return;
    logEvent(getAnalytics(), name, params);
  }
  ```
- **Where to call events:** Call `trackEvent` directly in the action handlers (e.g. inside `signUpWithEmail` in `AuthContext`, inside `createDeck` in `DeckRepository`). Do not spread tracking calls across UI components — keep them co-located with the action.
- **`page_view` with App Router:** Next.js App Router does not fire traditional page view events on client-side navigation. Use a `useEffect` watching `usePathname()` in a top-level `<Analytics>` client component placed in `app/layout.tsx`.
- **Firebase Analytics in development:** Analytics events appear in the Firebase DebugView (enable via `?debug_mode=1` URL param or `analytics.setAnalyticsCollectionEnabled(true)`). No emulator support — use DebugView in the real Firebase project for manual verification.
