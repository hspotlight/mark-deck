# PRD: mark-deck MVP

## Problem Statement

Instructors, educators, and individual creators need to build and share slide decks for workshops, lectures, and talks. Existing tools fall into two camps: presentation apps like Google Slides or PowerPoint (click-heavy, layout-fighting, no markdown) or developer tools like Marp CLI and VS Code extensions (too technical, requires local setup, no easy sharing). There is no approachable, web-based tool that lets a non-developer creator write markdown slides, preview them live, and publish a shareable link — without installing anything or knowing how to use a terminal.

---

## Solution

mark-deck is a web-based SaaS where users write Marp markdown in a split-panel editor, see a live preview, and publish their deck to a permanent public URL. The editor feels like a clean writing tool, not a code editor. Publishing is one click. The shared URL is human-readable and tied to the instructor's name, reinforcing their personal brand.

---

## User Stories

### Authentication & Onboarding

1. As an anonymous visitor, I want to open the editor and start writing markdown slides immediately, so that I can evaluate the product before committing to sign up.
2. As an anonymous visitor, I want to see a live preview of my slides as I type, so that I understand what the output will look like without any setup.
3. As an anonymous visitor who is ready to save my work, I want to be prompted to sign in and have my current markdown preserved, so that I do not lose what I wrote.
4. As a new user, I want to sign in with Google in one click, so that I can get started without creating a new password.
5. As a new user who prefers not to link everything to Google, I want to sign in with email and password, so that I have an independent account that is not a single point of failure.
6. As a new user signing up for the first time, I want to choose a permanent public username (handle), so that my published decks have a clean, personal URL.
7. As a new user, I want to understand that my username cannot be changed after it is set, so that I choose it carefully.
8. As a returning user, I want to be taken directly to my dashboard after signing in, so that I can resume my work immediately.

### Dashboard

9. As a logged-in user, I want to see all my decks displayed as a grid of cards with thumbnails, so that I can visually identify each deck at a glance.
10. As a logged-in user, I want each deck card to show the title and last edited date, so that I can find recently edited decks quickly.
11. As a logged-in user, I want a prominent "New Deck" card in the top-left of the grid, so that starting a new deck is always one click away.
12. As a logged-in user, I want to right-click or use a context menu on a deck card to rename it, so that I can keep my library organized.
13. As a logged-in user, I want to duplicate a deck from the context menu, so that I can use an existing deck as a template for a new one.
14. As a logged-in user, I want to delete a deck from the context menu with a confirmation prompt, so that I do not accidentally lose my work.
15. As a free-tier user who already has one deck, I want to see a modal explaining the free tier limit and a waitlist CTA when I try to create a second deck, so that I understand why I am blocked and know how to get more.

### Editor

16. As a logged-in user creating a new deck, I want a modal that asks only for the deck title before opening the editor, so that I can get to writing immediately.
17. As a logged-in user in the editor, I want a split-panel view with my markdown on the left and a live preview on the right, so that I can see how my slides look as I write.
18. As a logged-in user, I want the preview to update automatically about 500ms after I stop typing, so that the editor feels live without being laggy.
19. As a logged-in user, I want a toolbar above the editor with buttons for Bold, Italic, New Slide, Theme picker, and Image upload, so that I can perform common actions without memorizing markdown syntax.
20. As a logged-in user, I want a deck title input and an optional description field above the editor panels, so that I can document my deck's purpose alongside the content.
21. As a logged-in user, I want the editor to show a `Saving...` / `Saved ✓` / `Unsaved changes` indicator in the header, so that I always know whether my work is safe.
22. As a logged-in user, I want my work to auto-save to the cloud continuously as I type, so that I never lose progress due to a browser crash or accidental tab close.
23. As a logged-in user, I want the `---` slide separator to appear as a visual divider in the editor, so that I can easily see where each slide begins and ends.
24. As a logged-in user, I want to select a theme from a dropdown in the toolbar, so that I can change the visual style of my slides without editing the markdown.
25. As a logged-in user writing slides, I want the editor to use a clean monospace font with markdown syntax highlighting, so that my content is readable without feeling like a developer IDE.

### Slug & Publishing

26. As a logged-in user, I want my deck slug to be auto-generated from the title when I create the deck, so that I do not have to think about URL naming.
27. As a logged-in user before my first publish, I want to be able to edit the auto-generated slug, so that I can clean it up before it goes live.
28. As a logged-in user after publishing, I want the slug to be locked with a tooltip explaining why, so that my shared links never break.
29. As a logged-in user, I want to set my deck's visibility to public, unlisted, or private, so that I have full control over who can see my content.
30. As a logged-in user, I want unlisted to be the default visibility, so that draft decks are not accidentally indexed by search engines.
31. As a logged-in user, I want to click a Publish button that exports my deck to PDF and HTML via the server and saves the output to cloud storage, so that viewers always get the rendered output and not raw markdown.
32. As a logged-in user, I want to see a loading spinner while my deck is being exported, so that I know the system is working.
33. As a logged-in user after publishing, I want to see and copy my public deck URL directly in the editor, so that I can share it immediately.

### Image Upload

34. As a logged-in user, I want to upload an image from my computer and have it automatically inserted into my markdown at the cursor position, so that I can add visuals without hosting images elsewhere.
35. As a logged-in user uploading an image larger than 5MB, I want a clear error message, so that I understand why the upload failed.
36. As a logged-in user whose total storage is near 50MB, I want to see my storage usage in settings, so that I can manage my uploads proactively.
37. As a logged-in user who has hit the 50MB storage limit, I want a clear error message when attempting to upload more, so that I know I need to delete old images.

### Public Deck Viewer

38. As a viewer receiving a shared deck link, I want to see the deck displayed in a full, interactive slide viewer embedded in the app's page, so that I can navigate slides with arrow keys in a polished experience.
39. As a viewer, I want to see the deck title, author name, published date, description, view count, and download count on the page, so that I have full context about the deck.
40. As a viewer, I want to click the author's name and be taken to their public profile, so that I can discover more of their work.
41. As a viewer, I want a Download PDF button that downloads the deck and records a download event, so that I can use the slides offline.
42. As a viewer, I want social share buttons (Twitter/X, copy link) on the deck page, so that I can easily spread the content.
43. As a viewer on a mobile device, I want the deck page to be fully responsive, so that I can comfortably view slides on my phone.
44. As a viewer clicking a deleted deck's URL, I want to see a clean 404 page, so that I am not left confused by a broken experience.

### Author Profile Page

45. As a visitor to an author's profile page, I want to see their avatar, display name, and bio, so that I have context about who they are.
46. As a visitor, I want to see a grid of the author's public decks, so that I can browse all their published content in one place.
47. As an author, I want my Google profile photo used as my avatar automatically, so that I do not need to upload a separate image.
48. As an email/password user, I want a colored initials avatar generated automatically, so that my profile page looks complete without needing a photo.

### Settings

49. As a logged-in user, I want to edit my one-line bio in settings, so that visitors to my profile know who I am.
50. As a logged-in user, I want to see my storage usage (e.g. "12MB / 50MB used") in settings, so that I can manage my image uploads.
51. As a logged-in user, I want to see my account details (email, sign-in method) in settings, so that I can verify my account information.

### Waitlist

52. As a logged-in user who hits the free tier limit, I want a modal with a link to the waitlist, so that I can express interest in Pro without leaving the app.
53. As a logged-in user on the waitlist page, I want to join with one click using my existing account email, so that the process requires no extra typing.
54. As a non-logged-in visitor on the waitlist page, I want to enter my email address to join, so that I can get notified when Pro launches even without an account.

### Navigation & General UX

55. As a logged-in user, I want a consistent top navigation bar with Logo, Dashboard link, New Deck button, and avatar dropdown, so that I can navigate to any key area from any page.
56. As a logged-in user, I want the avatar dropdown to contain links to my profile, settings, and sign out, so that account actions are always accessible.
57. As a user on a mobile screen attempting to open the editor, I want a friendly "best viewed on desktop" message, so that I understand the limitation instead of seeing a broken layout.

---

## Implementation Decisions

### Architecture

- **Frontend:** Next.js App Router. Public deck pages use SSR for SEO and Open Graph support. The editor is a pure client component.
- **Hosting:** Firebase App Hosting, linked directly to the GitHub repository for automated deployments.
- **Backend services:** Firebase Authentication, Firestore (database), Firebase Storage (images and exported files), Firebase Cloud Functions (Marp export).
- **State management:** React Context only — `AuthContext` for user/session state, `EditorContext` for markdown content, theme, save status, and export status. No external state library needed.
- **UI:** MUI (Material UI) for components with Tailwind CSS for layout and utility styling. MUI's `StyledEngineProvider` configured to inject styles before Tailwind to prevent specificity conflicts.

### Modules

**AuthModule**
- Wraps Firebase Auth. Exposes `useAuth()` hook via `AuthContext`.
- Handles Google sign-in, email/password sign-in and registration, anonymous sessions, and anonymous-to-permanent account migration.
- On migration: writes the anonymous user's in-memory markdown to Firestore as their first deck.

**DeckRepository**
- Encapsulates all Firestore read/write operations for decks.
- Interface: `createDeck`, `getDeck`, `listDecks`, `updateDeck`, `deleteDeck`, `incrementViewCount`, `incrementDownloadCount`.
- Enforces the free tier limit (max 1 deck) at write time.
- Handles slug generation (title → kebab-case) and slug uniqueness per user.

**EditorModule**
- CodeMirror instance configured with Markdown language support.
- `---` separator rendered as a visual full-width divider via a CodeMirror decoration extension.
- Debounced onChange triggers auto-save after 500ms of inactivity.
- Save status managed in `EditorContext`: `idle | saving | saved | unsaved`.

**MarpPreviewModule**
- Client-side `@marp-team/marp-core` instance.
- Accepts markdown string and theme name. Returns rendered HTML string.
- Rendered HTML injected into a sandboxed iframe in the right panel.
- Called on debounced editor change (same 500ms trigger as auto-save).

**ExportFunction (Cloud Function)**
- HTTP callable Firebase Cloud Function.
- Accepts: `{ deckId, markdown, theme, formats: ['pdf', 'html'] }`.
- Runs Marp CLI to produce PDF and/or HTML output.
- Uploads artifacts to Firebase Storage at `exports/{userId}/{deckId}/deck.pdf` and `deck.html`.
- Returns public download URLs.
- Updates the deck's Firestore document with export URLs and `publishedAt` timestamp.

**ImageUploadModule**
- Validates file size (max 5MB) before upload.
- Checks user's current storage usage against 50MB quota before upload.
- Uploads to Firebase Storage at `images/{userId}/{timestamp}-{filename}`.
- Returns the public URL, which is inserted at cursor position in the editor.

**SlugModule**
- Converts deck title to URL-safe kebab-case slug.
- Checks Firestore for slug uniqueness per user, appending `-2`, `-3` etc. if taken.
- Slug locked after first publish (enforced in `DeckRepository.updateDeck`).

**PublicDeckPage**
- SSR page at `/[username]/[deckSlug]`.
- Fetches deck metadata from Firestore server-side for SEO.
- Increments view count on page load via a client-side call to `DeckRepository.incrementViewCount`.
- Renders an iframe embedding the exported HTML from Firebase Storage.
- Generates dynamic OG image via Next.js `ImageResponse` using the first slide content.

**WaitlistModule**
- Stores email + optional `userId` in a `waitlist` Firestore collection.
- For logged-in users: pre-populates email, single confirm button.
- For anonymous users: email input form with basic format validation.

### Data Schema (Firestore)

**`users/{userId}`**
- `username: string` — permanent, unique
- `displayName: string`
- `email: string`
- `avatarUrl: string | null`
- `bio: string` — optional
- `storageUsedBytes: number`
- `createdAt: timestamp`

**`decks/{deckId}`**
- `userId: string`
- `username: string` — denormalized for URL routing
- `title: string`
- `slug: string`
- `description: string` — optional
- `markdown: string`
- `theme: string`
- `visibility: 'public' | 'unlisted' | 'private'`
- `pdfUrl: string | null`
- `htmlUrl: string | null`
- `publishedAt: timestamp | null`
- `viewCount: number`
- `downloadCount: number`
- `createdAt: timestamp`
- `updatedAt: timestamp`

**`waitlist/{docId}`**
- `email: string`
- `userId: string | null`
- `createdAt: timestamp`

### API Contracts

**Export Cloud Function**
- Input: `{ deckId: string, markdown: string, theme: string, formats: ('pdf' | 'html')[] }`
- Output: `{ pdfUrl: string | null, htmlUrl: string | null }`
- Errors: `unauthenticated`, `resource-exhausted` (storage quota), `internal`

### Firebase Security Rules

- Decks readable by anyone if `visibility !== 'private'`; writable only by owner.
- Storage: images readable by anyone, writable only by owner within quota.
- Waitlist: write-only for all users, no reads from client.

---

## Testing Decisions

**What makes a good test:** Tests should verify observable behavior from the outside — what a user or caller sees — not internal implementation details. Avoid testing that a specific function was called; test that the correct outcome occurred.

### Unit Tests (Jest)

- **AuthModule:** Test anonymous → permanent migration logic. Mock Firebase Auth entirely — verify that the in-memory markdown is written to Firestore on sign-in.
- **SlugModule:** Test slug generation from titles (special characters, spaces, duplicates, length limits). Pure function — no mocks needed.
- **DeckRepository:** Test free tier enforcement — mock Firestore, assert that `createDeck` throws when the user already has 1 deck.
- **ImageUploadModule:** Test client-side validation — file size rejection, quota exceeded rejection — without hitting real Firebase Storage.
- **MarpPreviewModule:** Test that given known markdown input, the renderer returns HTML containing expected slide content. Verify theme switching produces different CSS class names.

### E2E Tests (Playwright + Firebase Emulator Suite)

The Firebase Emulator runs Auth, Firestore, and Storage locally. Test users are created via `signInWithCustomToken()` — no real Google OAuth required.

- **Full write → publish flow:** Sign in as test user → create deck → write markdown → publish → assert exported files appear in emulated Storage → assert deck document has `publishedAt` set.
- **Anonymous migration:** Write markdown as anonymous → sign in → assert deck appears in dashboard with original content.
- **Free tier limit:** Create 1 deck → attempt to create 2nd → assert modal appears, no deck created.
- **Public deck viewer:** Publish deck → navigate to public URL as unauthenticated user → assert slide iframe loads → assert view count increments.
- **Image upload:** Upload a valid image → assert markdown contains the Storage URL → upload a 6MB file → assert error message shown.
- **Delete flow:** Delete deck → assert dashboard empty → navigate to former public URL → assert 404.

---

## Out of Scope

- Team collaboration or shared editing of decks
- Real-time co-editing (multiple cursors)
- Custom avatar image upload
- Email notifications of any kind (export complete, view milestones, welcome)
- Admin dashboard or moderation tools — use Firebase Console directly
- GitHub OAuth
- Public deck discovery / explore gallery
- Stripe billing or any paid subscription at launch
- Custom domains for published decks
- Deck resize handle in editor (fixed 50/50 split at MVP)
- Slide reordering via drag-and-drop
- Presenter mode / speaker notes view
- Version history or undo beyond browser undo

---

## Further Notes

- **Pro plan:** Not built at MVP. "Pro coming soon" messaging and an email waitlist are in scope to validate demand before building billing infrastructure. Free tier is intentionally tight (1 deck) to drive waitlist conversions.
- **Username permanence:** The decision to make usernames permanent is intentional and should be clearly communicated during onboarding. It keeps public URLs stable and prevents brand squatting.
- **MUI + Tailwind conflict:** Configure MUI's `StyledEngineProvider` with `injectFirst` to ensure Tailwind utility classes can override MUI defaults without needing `!important`.
- **Marp CLI in Cloud Functions:** Use a Node.js Cloud Function with the `@marp-team/marp-cli` package. Ensure the function's memory is set to at least 512MB and timeout to 60s to handle large decks.
- **OG Image generation:** The first slide's HTML is rendered to a PNG via Next.js `ImageResponse` at the route `/[username]/[deckSlug]/opengraph-image`. This requires the slide HTML to be available server-side, so the exported HTML URL from Storage is fetched during SSR.
- **Storage quota tracking:** `storageUsedBytes` on the user document is updated atomically using Firestore `FieldValue.increment` on every upload and delete. The Cloud Function also validates this before processing exports.
