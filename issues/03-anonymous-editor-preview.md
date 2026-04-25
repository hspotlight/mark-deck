# 03 — Anonymous Editor + Marp Live Preview

**Group:** A – Non-Login User
**Type:** AFK
**Blocked by:** #01 Project Scaffold

---

## What to build

A fully functional split-panel markdown editor at `/editor` that any visitor can open without signing in. The left panel is a CodeMirror editor with Markdown highlighting and visual `---` slide separators. The right panel renders a live Marp preview, updating 500ms after the last keystroke. Nothing is saved — this is entirely in-memory. A persistent "Sign in to save" banner prompts conversion.

This slice is the core product hook: a visitor should be able to evaluate mark-deck's value in under 30 seconds without creating an account.

---

## Acceptance criteria

### Route & layout
- [ ] Route `/editor` renders without auth — no redirect
- [ ] Desktop-only: on viewports < 768px, show a "best viewed on desktop" message instead of the editor panels
- [ ] Split-panel layout: editor left, preview right, 50/50 fixed split, 1px `#E2E8F0` divider
- [ ] Header bar (56px, white, `border-b`): logo left, "Sign in to save" banner center, "Sign In" button right

### CodeMirror editor (left panel)
- [ ] CodeMirror 6 installed and rendered in a `"use client"` component
- [ ] Markdown language extension enabled (syntax highlighting for `**bold**`, `# headings`, etc.)
- [ ] Editor font: JetBrains Mono 14px, line-height 1.6, white background
- [ ] `---` slide separator rendered as a full-width `#E2E8F0` horizontal rule via a CodeMirror `Decoration` extension (the `---` text is replaced visually, not hidden)
- [ ] Placeholder text shown when editor is empty: e.g. `# My First Slide\n\nStart writing...`
- [ ] Editor fills full panel height; scrollable independently of the preview

### Toolbar (above editor, 48px, white, `border-b`)
- [ ] **Theme dropdown:** lists all 8 themes (Default, Gaia, Uncover, Professional, Academic, Dark, Vibrant, Minimal) — changing theme updates the preview immediately
- [ ] **New Slide button:** inserts `\n\n---\n\n` at the current cursor position
- [ ] **Bold button:** wraps selected text in `**...**` (or inserts `****` with cursor between if no selection)
- [ ] **Italic button:** wraps selected text in `*...*`
- [ ] **Image button:** disabled with tooltip "Sign in to upload images" (upload is auth-gated; built in #15)

### Marp live preview (right panel)
- [ ] `@marp-team/marp-core` installed
- [ ] `MarpPreviewModule`: accepts `markdown: string` and `theme: string`, returns rendered HTML
- [ ] Preview rendered in a sandboxed `<iframe srcdoc={html}>` — Marp CSS is injected inside the iframe, not leaked to the host page
- [ ] Preview updates 500ms after last keystroke (debounced via `useEffect` + `setTimeout`)
- [ ] Preview panel background: `#F8FAFC`
- [ ] If markdown is empty, preview shows a placeholder slide

### Themes
- [ ] All 3 Marp built-in themes (default, gaia, uncover) work via `new Marp({ theme })` option
- [ ] 5 mark-deck branded themes (Professional, Academic, Dark, Vibrant, Minimal) defined as custom CSS files in `src/themes/`; each is registered with the Marp instance via `marp.themeSet.add(css)`
- [ ] Branded theme CSS files implement the color palette defined in DESIGN.md (background, text, accent per theme)
- [ ] Theme selection persists in component state for the session (not persisted to storage)

### EditorContext
- [ ] `EditorContext` created: holds `markdown`, `theme`, `setMarkdown`, `setTheme`
- [ ] Context wraps the editor page — both toolbar and preview panels read from it
- [ ] No persistence in this slice (in-memory only)

### "Sign in to save" conversion
- [ ] Persistent banner in header: *"You're in guest mode — sign in to save and publish your deck"*
- [ ] "Sign In" button in header navigates to `/login`
- [ ] Banner not shown if user is already signed in (checked via `AuthContext` — even though auth isn't built yet, the context should return `null` user by default)

### Tests
- [ ] Jest unit: `SlugModule` — not needed here yet, but `MarpPreviewModule` is testable: given known markdown, assert returned HTML contains expected slide content; assert theme switching changes CSS class
- [ ] Playwright: navigate to `/editor` → type markdown → assert preview iframe updates within 1s → click "New Slide" → assert `---` inserted → change theme → assert preview re-renders
- [ ] Playwright: on mobile viewport (375px) → assert "best viewed on desktop" message shown, editor not rendered

---

## Implementation notes

- **CodeMirror `---` decoration:** Use `ViewPlugin` + `Decoration.replace` (or `Decoration.mark`) on lines that are exactly `---`. Use a `WidgetDecoration` that renders a `<hr>` styled as a full-width `#E2E8F0` divider.
- **Marp iframe sandbox:** Use `sandbox="allow-scripts"` on the iframe so Marp's JS (slide navigation) runs but cross-origin access is blocked.
- **Marp instance:** Create a single `Marp` instance per render call in `MarpPreviewModule` — do not share state across renders to avoid CSS contamination between themes.
- **Branded theme CSS files:** Place in `src/themes/*.css`. Each file starts with `/* @theme mark-deck-professional */` (or whichever name). The comment is required by Marp for theme registration.
- **Debounce:** Use a plain `useEffect` cleanup pattern (`clearTimeout` on re-render) rather than a library to keep dependencies minimal.
