---
marp: true
theme: default
paginate: true
html: true
---

# Zero to SaaS

<img src="hspotlight-logo.jpg" width="200" style="position:absolute;right:40px;top:40px;">

## เจาะลึก Architecture สร้างธุรกิจด้วย AI ด้วยเงิน 0 บาท

**Stack:** Vanilla HTML/CSS/JS · Firebase · GitHub · Claude Code

**HSpotlight** · 30 April 2026

---

## Agenda

| # | Section | Time |
|---|---|---|
| 1 | What we're building | 5 min |
| 2 | Setup verification | 10 min |
| 3 | Clone starter repo | 5 min |
| 4 | Claude Code workflow | 20 min |
| 5 | Firebase project setup | 15 min |
| 6 | CI/CD with Firebase CLI | 20 min |
| 7 | Git + env strategy | 15 min |
| 8 | Decision framework | 10 min |
| 9 | Analytics | 5 min |
| 10 | Q&A + What's next | 15 min |

---

## Ground Rules

1. We will go to the finish line together
2. Feel free to ask questions at any time

---

# 1. What We're Building

---

## Link-in-Bio SaaS

A personal page that lists your links — think Linktree.

**Public side**
- Anyone can visit like `https://<app name>.web.app/`
- See profile + clickable links

**Private side**
- Log in to manage your links
- Add, reorder, delete

**Why this app?**
Hosting feels meaningful · Auth makes sense · Firestore is simple · You can personalize it

---

## Live Demo

> **[TODO: insert your Link-in-Bio URL here]**

**What you will have at the end of today:**
- A deployed Link-in-Bio app on Firebase Hosting
- A CI/CD pipeline that auto-deploys on PR and merge
- Two environments: test and prod

---

# 2. Setup Verification

**Action:** Run version check commands in your terminal
**Result:** All tools confirmed — Node, Firebase CLI, git, Claude Code logged in

---

## Pre-workshop Checklist

Run this to verify everything is installed:

```bash
node -v          # should be v18+
firebase --version   # should be 13+
git --version     # should be 2+
claude --version # Claude Code CLI
```

If anything is missing → raise your hand now

---

## Required Tools

| Tool | Install |
|---|---|
| Node.js | https://nodejs.org |
| Firebase CLI | `npm install -g firebase-tools` |
| git CLI | https://git-scm.com/install/mac |
| Claude Code | https://claude.ai/code |

**Auth check:**
```bash
firebase login
```

---

# 3. Clone Starter Repo

**Action:** Clone the workshop repo and open it in your editor
**Result:** Project folder open locally, solution branch available if you get stuck

---

## Get the Starter

```bash
git clone https://github.com/hspotlight/zero-to-saas-workshop
cd zero-to-saas-workshop
```

**Repo structure:**
```
zero-to-saas-workshop/
├── index.html        # public profile page
├── admin.html        # login + manage links
├── app.js            # app logic (mostly empty)
├── style.css         # basic styles
├── firebase.js       # Firebase config placeholder
├── .env.example      # env template
└── __tests__/
    └── links.test.js # pre-written Jest test
```

> **Solution branch:** `git checkout solution` if you get stuck

---

# 4. Claude Code Workflow

**Action:** Plan → PRD → CLAUDE.md → Agents → Scaffold
**Result:** Project fully planned, rules set, agents created, app structure generated from your PRD

---

## Claude Code Workflow — Overview

```
1. /grill-me                        → define the project (Q&A)
2. /to-prd                          → convert plan to PRD doc
3. CLAUDE.md                        → set rules and guardrails
4. Agents                           → ask Claude to create project agents
5. /firebase-webapp-scaffold prd.md → build from PRD
6. Dev loop                         → TDD + vertical slicing per feature
```

---

## What is Claude Code?

Claude Code is an AI coding agent that runs in your terminal.

It can:
- Read and write files
- Run commands
- Understand your entire project
- Follow project-specific rules you define

---

## Skills: Pre-built Workflows

The starter repo already includes three skills:

| Skill | What it does |
|---|---|
| `/grill-me` | Interviews you to define the project |
| `/to-prd` | Converts the plan into a PRD document |
| `/firebase-webapp-scaffold` | Scaffolds the app from the PRD |

Skills live in the repo — no extra install needed.

---

## Step 1: Plan with `/grill-me`

Before writing any code, run:

```
/grill-me I want to build a Link-in-Bio app using Firebase
```

Claude interviews you — one question at a time — until it has a complete picture of what to build.

**Rule:** Plan before you code. Always.

---

## Step 2: Write the PRD with `/to-prd`

Once the plan is agreed, run:

```
/to-prd
```

Claude converts the conversation into a structured Product Requirements Document and saves it to the repo.

> The PRD is the source of truth for everything that follows.

---

## Step 3: Create `CLAUDE.md`

Create `CLAUDE.md` — rules Claude must follow on every task:

```markdown
# Link-in-Bio Project

## Stack
- Vanilla HTML/CSS/JS · Firebase Auth · Firestore · Hosting

## Workflow
- TDD: write test first, then implementation
- Vertical slicing: each feature is end-to-end (UI → logic → data → test)
- Keep all Firebase logic in firebase.js
- Never commit .env files
- One feature per branch, PR to merge
```

> `CLAUDE.md` = guardrails. Claude reads this on every task.

---

## Step 4: Create Agents

Ask Claude to generate agents for this project:

```
Help me create agents for this project including
a developer agent, a QA agent, and a code reviewer agent.
```

Claude creates `AGENTS.md` with tailored agents based on your stack and PRD.

---

## Step 5: Scaffold with `/firebase-webapp-scaffold`

Once CLAUDE.md and agents are in place, run:

```
/firebase-webapp-scaffold prd.md
```

Claude reads the PRD doc and builds the full app structure for you.

---

## Step 6: The Development Loop

For each feature — end-to-end, one slice at a time:

```
1. Pick a feature slice from the PRD
2. Write the test first (Jest)
3. Claude implements until the test passes
4. Verify in the browser
5. /commit → push → open PR
6. Repeat
```

> One slice = one complete user-facing behaviour, not just a layer.

---

# 5. Firebase Project Setup

**Action:** Create two Firebase projects (test + prod), configure env files, enable services
**Result:** Two live Firebase projects wired to your local `.env.test` and `.env.prod`

---

## Firebase: What We're Using

| Service | What it does |
|---|---|
| **Authentication** | Login with email/password or Google |
| **Firestore** | Store user links as documents |
| **Hosting** | Serve the app publicly |
| **Analytics** | Track page views and events |

---

## Create Two Firebase Projects

We need two projects: **test** and **prod**

```bash
# Go to console.firebase.google.com
# Create project: link-in-bio-test
# Create project: link-in-bio-prod
```

**Why two projects?**
- Test = your sandbox. Break things here.
- Prod = real users, real data. Never experiment here.

---

## Configure Environment Variables

Copy the template:
```bash
cp .env.example .env.test
cp .env.example .env.prod
```

Fill in each file with the Firebase config from the console:

```env
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_APP_ID=...
```

> **Never commit `.env` files.** They are in `.gitignore` already.

---

## Enable Firebase Services

In each Firebase project console, enable:

1. **Authentication** → Sign-in method → Email/Password
2. **Firestore** → Create database → Start in test mode
3. **Hosting** → Get started

Do this for both `link-in-bio-test` and `link-in-bio-prod`.

---

# 6. CI/CD with Firebase CLI

**Action:** Run `firebase init hosting:github`, add test step, open your first PR
**Result:** Every PR auto-deploys to test, every merge to main auto-deploys to prod

---

## Set Up GitHub Actions

Firebase CLI generates the workflow for you:

```bash
firebase init hosting:github
```

It will:
1. Ask which GitHub repo to connect
2. Create a service account automatically
3. Generate `.github/workflows/firebase-hosting-*.yml`

Your env vars stay in `.env.test` and `.env.prod` — never in GitHub secrets.

---

## Generated Workflow

```yaml
# On every PR: deploy to test project
on:
  pull_request:
    branches: [main]

# On merge to main: deploy to prod project
on:
  push:
    branches: [main]
```

Two workflows. Two projects. Automatic.

---

## Add a Test Step

Open the generated workflow file and add before deploy:

```yaml
- name: Install dependencies
  run: npm install

- name: Run tests
  run: npm test
```

Now tests must pass before any deployment happens.

---

## Open Your First PR

```bash
git checkout -b feature/add-auth
# ... your changes are already committed
git push origin feature/add-auth
```

Then open GitHub in the browser → **Compare & pull request**

Watch GitHub Actions:
- Tests run
- App deploys to test Firebase project
- Check the preview URL in the PR comment

---

# 7. Git + Environment Strategy

---

## The Mapping

```
feature branch
      │
      ▼
   Pull Request ──────────► test Firebase project
      │                      (link-in-bio-test)
      │ merge
      ▼
    main ──────────────────► prod Firebase project
                              (link-in-bio-prod)
```

---

## Two Branching Strategies

| | Trunk-based | Feature branch ✅ |
|---|---|---|
| How | Commit directly to `main` | Each feature = its own branch |
| PR required | No | Yes |
| Tests gate deploy | Optional | Yes (on PR) |
| Best for | simple or team has good practice | project is complex |
| Risk | Broken code reaches prod faster | More overhead per change |

---

## Rule of Thumb

> Trunk-based for solo projects where speed matters.
> Feature branch when you have real users or a team.

Both are valid. Choose deliberately.

---

# 8. Decision Framework

---

## GitHub Pages vs Firebase Hosting

| | GitHub Pages | Firebase Hosting |
|---|---|---|
| Price | Free | Free tier |
| Repo | public is free | Any |
| Static sites | ✅ | ✅ |
| Firebase services | ✅ | ✅ |
| multi env | ❌ | ✅ |
| Setup | Very easy | Easy |

**Simple rule:**
If you use Firebase Auth or Firestore → Firebase Hosting.
Pure static site, public repo → either works.

---

## 1 Environment vs 2 Environments

**Ask yourself:**

> "If a bug reaches this environment, does it affect real users or real data?"

| Situation | Recommendation |
|---|---|
| Personal blog, portfolio | 1 env is fine |
| App with real users | 2 envs |
| App with paying users | 2 envs |
| Regulated data | 2 envs |

---

# 9. Analytics

**Action:** Enable Google Analytics in both Firebase projects
**Result:** Page views and sessions tracking — check the console tomorrow

---

## Firebase Analytics

Enable in each Firebase project console:
**Analytics → Enable Google Analytics**

What it tracks automatically:
- Page views
- Sessions
- User geography

What you can add:
```javascript
import { logEvent } from "firebase/analytics";
logEvent(analytics, "link_clicked", { url: "https://..." });
```

> Events take ~24h to appear in the console. Enable it now, check it tomorrow.

---

# 10. What's Next

---

## What You Built Today

- Link-in-Bio app deployed on Firebase Hosting
- Firebase Auth + Firestore
- CI/CD pipeline: PR → test, merge → prod
- Two environments wired to two Firebase projects
- Tests running on every PR

---

## Take Home

- [ ] Set up your own project
- [ ] Enable Analytics and check it in 24h
- [ ] Explore: Firebase Auth, Firebase Functions

---

## Resources

- Firebase Docs: https://firebase.google.com/docs
- Claude Code: https://claude.ai/code
- GitHub Actions: https://docs.github.com/actions

---

# Q&A

### Ask anything.

---

# Thank You

**Workshop repo:** https://github.com/hspotlight/zero-to-saas-workshop
**Solution branch:** `git checkout solution`
