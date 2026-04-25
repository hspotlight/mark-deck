# 15 — Image Upload – Toolbar + Storage + Quota Validation

**Group:** C – Logged-In User
**Type:** AFK
**Blocked by:** #12 Deck Editor – CodeMirror + Auto-Save

---

## What to build

The image upload button in the editor toolbar: validates file size client-side, checks storage quota, uploads to Firebase Storage, and inserts the resulting URL as a Markdown image at the cursor position. Storage usage is tracked atomically on the user document.

---

## Acceptance criteria

### Upload flow
- [ ] Clicking the image button in the toolbar opens a native file picker (`<input type="file" accept="image/*">`)
- [ ] After file selection, the upload flow runs immediately (no separate confirm step)
- [ ] While uploading: image button shows a spinner and is disabled; editor toolbar shows *"Uploading image..."*
- [ ] On success: inserts `![](https://storage.url/...)` at the current cursor position in CodeMirror
- [ ] On any error: shows an error snackbar (bottom-center, 3s); does not insert anything into editor

### Client-side validation (before upload)
- [ ] File size > 5MB: show error snackbar *"Image too large — maximum 5MB per file"*; do not upload
- [ ] `user.storageUsedBytes + file.size > 50MB`: show error snackbar *"Storage full (50MB limit) — delete unused images to free up space"*; do not upload
- [ ] Non-image MIME type (browser `file.type` check): show error snackbar *"Only image files are supported"*

### Firebase Storage upload
- [ ] Upload path: `images/{userId}/{timestamp}-{sanitizedFilename}` (sanitize: strip non-alphanumeric, lowercase, replace spaces with `-`)
- [ ] Use Firebase Storage `uploadBytesResumable` — progress reporting is not required at MVP, but the resumable API is used for future extensibility
- [ ] After upload completes, call `getDownloadURL(ref)` to get the public URL

### Storage quota tracking
- [ ] After successful upload, increment `users/{userId}.storageUsedBytes` by `file.size` using `FieldValue.increment(file.size)`
- [ ] The client-side quota check reads the current `storageUsedBytes` from `AuthContext` (which reflects the Firestore value) — not a fresh Firestore read on each upload
- [ ] `AuthContext` subscribes to `users/{userId}` via `onSnapshot` so `storageUsedBytes` stays current

### ImageUploadModule (`src/modules/imageUpload.ts`)
- [ ] Exports `uploadImage(file: File, userId: string, storageUsedBytes: number): Promise<string>`
- [ ] Contains all validation, upload, and quota-update logic
- [ ] Returns the public download URL on success; throws typed errors for each failure case

### Settings page integration
- [ ] Storage usage shown in Settings (#16): `{usedMB} MB / 50 MB used` with a MUI `LinearProgress` bar — this uses the same `storageUsedBytes` from `AuthContext`

### Tests
- [ ] Jest unit (ImageUploadModule): mock Storage + Firestore — upload a 2MB file as a user with 30MB used → assert upload called, `storageUsedBytes` incremented → returns a URL
- [ ] Jest unit: 6MB file → assert throws `FILE_TOO_LARGE` error before any Storage call
- [ ] Jest unit: 2MB file with user at 49MB used (2MB would exceed 50MB) → assert throws `QUOTA_EXCEEDED` before any Storage call
- [ ] Playwright (emulator): open editor → click image button → select a valid fixture image file → assert `![](url)` inserted into editor at cursor → assert `users/{uid}.storageUsedBytes` incremented in Firestore
- [ ] Playwright: select a file > 5MB (or simulate via mocked file object) → assert error snackbar shown, nothing inserted

---

## Implementation notes

- **Cursor insertion in CodeMirror:** Use the CodeMirror `EditorView.dispatch` API to insert text at `view.state.selection.main.from`. Expose a `insertAtCursor(text: string)` function from the `EditorModule` that the toolbar can call.
- **File picker trigger:** The `<input type="file">` element should be hidden and triggered by `ref.current.click()` when the toolbar button is pressed. Reset the input's value after each selection so the same file can be re-selected after an error.
- **`storageUsedBytes` in AuthContext:** Add a Firestore `onSnapshot` on `users/{uid}` to the `AuthContext` so `storageUsedBytes` is always fresh without an extra read in `ImageUploadModule`.
- **Filename sanitization:** `sanitizeFilename(name)` — lowercase, replace spaces with `-`, strip chars not in `[a-z0-9._-]`, max 100 chars.
- **Storage rules:** Already defined in #01: images writable by owner only. Verify rules block other users from writing to `images/{anotherUserId}/`.
