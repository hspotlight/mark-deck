# 01 — Project Scaffold & Firebase Config

**Group:** A – Non-Login User
**Type:** AFK
**Blocked by:** None — can start immediately

---

## What to build

Bootstrap the full project skeleton end-to-end: Next.js App Router project wired to Firebase (Auth, Firestore, Storage, Cloud Functions) with MUI + Tailwind CSS configured correctly. The result is a running dev server with no errors, a deployed Firebase project, and the test harness (Jest + Playwright + Firebase Emulator) ready to run.

---

## Acceptance criteria

### Next.js
- [ ] `npx create-next-app` with App Router, TypeScript, ESLint, and Tailwind CSS
- [ ] `src/app/` directory structure with a placeholder `page.tsx` at `/`
- [ ] JetBrains Mono loaded via `next/font` for editor use; Inter loaded for body/headings
- [ ] `next.config.ts` allows Firebase Storage image domains

### MUI + Tailwind
- [ ] `@mui/material`, `@emotion/react`, `@emotion/styled` installed
- [ ] `StyledEngineProvider injectFirst` wraps the app in `layout.tsx` so Tailwind utility classes override MUI defaults without `!important`
- [ ] MUI theme configured: primary color `#6366F1`, `disableElevation` as button default, `rounded-lg` paper border radius
- [ ] Verify: a test MUI `Button` styled with a Tailwind margin class renders correctly

### Firebase project
- [ ] Firebase project created (mark-deck) with Auth, Firestore, Storage, and Cloud Functions enabled
- [ ] `firebase.json` and `.firebaserc` committed (no secrets)
- [ ] `src/lib/firebase.ts` exports initialized `app`, `auth`, `db`, `storage`, `functions` — reads config from `NEXT_PUBLIC_FIREBASE_*` env vars
- [ ] `.env.local.example` documents all required env vars; `.env.local` is gitignored

### Firebase App Hosting
- [ ] `apphosting.yaml` present and linked to the GitHub repository
- [ ] Pushing to `main` triggers an automatic deploy (verify one successful build)

### Cloud Functions
- [ ] `functions/` directory initialized with TypeScript
- [ ] Placeholder `helloWorld` HTTP function deployed and reachable (used to verify Functions setup only — will be replaced in #14)

### Firebase Emulator Suite
- [ ] `firebase.json` emulators block configured for Auth (9099), Firestore (8080), Storage (9199), Functions (5001)
- [ ] `npm run emulators` starts all emulators without error
- [ ] Emulator UI reachable at `localhost:4000`

### Testing harness
- [ ] Jest configured with `ts-jest`; `npm test` runs with zero failures
- [ ] Playwright installed; `npm run e2e` runs against `localhost:3000` (placeholder spec passes)
- [ ] E2E tests read `FIREBASE_EMULATOR=true` env var and point Firebase SDK at emulator ports

### Firestore & Storage security rules
- [ ] `firestore.rules` scaffolded: decks readable if `visibility != 'private'`, writable by owner only; `users` readable by anyone, writable by owner only; `waitlist` write-only for all
- [ ] `storage.rules` scaffolded: images readable by anyone, writable by owner only
- [ ] Rules deployed to emulator and pass a basic rule unit test (`@firebase/rules-unit-testing`)

### CI
- [ ] GitHub Actions workflow: on push to `main` — install, lint, unit test, emulator e2e test
- [ ] Workflow passes on an empty commit after scaffold

---

## Implementation notes

- **MUI + Tailwind order:** `StyledEngineProvider injectFirst` must be in the root `layout.tsx`, not a page-level component.
- **Firebase SDK version:** Use Firebase JS SDK v11+ (modular API). No compat imports.
- **Cloud Functions runtime:** Node 20. Set `functions/package.json` `engines.node` to `"20"`.
- **Emulator seed data:** Add a `firebase/seed.ts` script that populates Firestore + Storage with fixture data for E2E tests. Run via `npm run seed`.
