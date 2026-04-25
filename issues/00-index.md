# mark-deck — Issue Index

20 vertical slices, grouped by user type. Each slice is a thin end-to-end cut through schema → backend → UI → tests.

---

## Group A: Non-Login User

| # | Title | Status |
|---|-------|--------|
| [01](01-project-scaffold.md) | Project Scaffold & Firebase Config | ✅ |
| [02](02-landing-page.md) | Landing Page | ✅ |
| [03](03-anonymous-editor-preview.md) | Anonymous Editor + Marp Live Preview | ✅ |
| [04](04-public-deck-viewer.md) | Public Deck Viewer | ✅ |
| [05](05-author-profile-page.md) | Author Profile Page | ✅ |
| [06](06-404-page.md) | 404 Page | ✅ |
| [07](07-waitlist-anonymous.md) | Waitlist Page – Anonymous Email Form | ✅ |

## Group B: Auth Bridge

| # | Title | Status |
|---|-------|--------|
| [08](08-authentication.md) | Authentication – Login Page + AuthContext | ☐ |
| [09](09-anonymous-migration.md) | Anonymous → Permanent Account Migration | ☐ |

## Group C: Logged-In User

| # | Title | Status |
|---|-------|--------|
| [10](10-navigation-bar.md) | App Navigation Bar | ☐ |
| [11](11-dashboard-deck-crud.md) | Dashboard + Deck CRUD | ☐ |
| [12](12-deck-editor-autosave.md) | Deck Editor – CodeMirror + Auto-Save | ☐ |
| [13](13-slug-management.md) | Slug Management | ☐ |
| [14](14-publish-export.md) | Publish Flow – Export Cloud Function + Storage | ☐ |
| [15](15-image-upload.md) | Image Upload – Toolbar + Storage + Quota Validation | ☐ |
| [16](16-settings-page.md) | Settings Page | ☐ |
| [17](17-free-tier-enforcement.md) | Free Tier Limit Enforcement | ☐ |
| [18](18-waitlist-loggedin.md) | Waitlist – Logged-In One-Click Join | ☐ |
| [19](19-og-image-social-share.md) | OG Image Generation + Social Share | ☐ |
| [20](20-analytics.md) | Analytics Integration | ☐ |

---

## Dependency Graph

```
#01 ──┬──> #02
      ├──> #03 ──────────────────────────────────> #09
      ├──> #04
      ├──> #05
      ├──> #06
      ├──> #07 ──────────────────────────────────> #18
      ├──> #08 ──> #09
      │         ├──> #10 ──> #11 ──> #12 ──> #13 ──> #14 ──> #19
      │         │                        ├──> #15
      │         │                        └──> #17 (also from #11)
      │         ├──> #16
      │         └──> #18
      └──> #20
```
