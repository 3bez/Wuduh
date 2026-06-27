# WUDUH

### وضوح

Master Status Document

| Field | Value |
|--------------|----------------------------------------------------------------------------------|
| **Document** | Master Status — Single Source of Truth                                           |
| **Version**  | 3.1 — Post-MVP                                                                   |
| **Date**     | June 2026                                                                        |
| **Live URL** | wuduh.site                                                                       |
| **Stack**    | Next.js 16 · Better Auth · PostgreSQL 17 · MinIO · Coolify                       |
| **Cards**    | 58 cards across 8 sections — Arabic & English                                    |
| **Status**   | MVP live. 5.1 critical fixes complete. Pre-launch (5.2) pending. V2 not started. |

## 1. What Wuduh Is

Wuduh is a card-based web tool that guides first-time founders in Saudi Arabia and the GCC through building a complete feasibility study — one question at a time. The founder answers 58 focused cards across 8 sections. When done, Wuduh assembles their answers into a professional investor-ready PDF in Arabic or English.

**Core principle:** The data belongs to the founder. Wuduh never generates content on their behalf. It structures, formats, and presents the founder's own inputs as a credible professional document.

### 1.1 Target Customer

- First-time founders in Saudi Arabia aged 22–35

- Pre-revenue, working alone or with a small co-founder team

- Preparing to approach an accelerator, angel investor, government grant, or bank

- Digitally comfortable, Arabic first language, no prior experience producing a formal feasibility study

### 1.2 Business Model

- Direct founders — SAR 99 per study export (pay at export, no upfront commitment)

- Accelerator cohort licensing — SAR 3,000 per cohort of up to 30 founders

- Payment gateway — Moyasar (MADA + Visa, SAMA-compliant) — not yet integrated

### 1.3 Go-To-Market

- B2B2C — accelerators are the buyer, founders are the user

- Primary targets — Monshaat, Flat6Labs Riyadh, KAUST Entrepreneurship, Badir, STC/Aramco

- Direct channels — Twitter/X Saudi startup community, Instagram, personal founder outreach

## 2. What Is Built — MVP Complete

> ✅ The MVP is live at wuduh.site. A founder can sign up, complete the full card journey in Arabic or English, and export a professional 9-page PDF. Everything below is deployed and working.

### 2.1 Infrastructure & Auth

| Field | Value |
|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **DONE** | Next.js 16.2.9 with App Router, TypeScript, Tailwind CSS, IBM Plex fonts                                                                                                                |
| **DONE** | Better Auth — email + password, email verification, password reset                                                                                                                      |
| **DONE** | PostgreSQL 17 self-hosted on Coolify — 8 tables (users, sessions, accounts, verifications, profiles, studies, answers, exports)                                                         |
| **DONE** | MinIO self-hosted on Coolify — S3-compatible file storage for logo uploads                                                                                                              |
| **DONE** | Resend — transactional email (signup confirmation, password reset)                                                                                                                      |
| **DONE** | PDFShift API — hosted Chromium PDF generation                                                                                                                                           |
| **DONE** | Coolify self-hosted deployment — Docker, rolling updates, no Vercel dependency                                                                                                          |
| **DONE** | Cloudflare DNS — wuduh.site A record pointing to VPS at 65.21.151.1                                                                                                                     |
| **DONE** | Auth guarding — per-route via Better Auth getSession in server components and API handlers (requireVerifiedUser / getVerifiedUser). No separate middleware file (proxy.ts was removed). |

### 2.2 Card Engine

| Field | Value |
|----------|----------------------------------------------------------------------------------------------------------------|
| **DONE** | All 58 cards loaded from wuduh-cards.json — single source of truth, bilingual                                  |
| **DONE** | TextCard — textarea, character counter, 800ms debounce auto-save, save on blur                                 |
| **DONE** | TableCard — repeatable rows, add/delete row, column headers from card config, number/select/auto-calc variants |
| **DONE** | UploadCard — file picker, preview, upload to MinIO, storage path saved as answer                               |
| **DONE** | LangCard (C0) — two-option selector, persists language to profile and study record                             |
| **DONE** | ProjectionsChart — live financial projections chart rendered in study UI from S4 onward                        |
| **DONE** | useAutoSave hook — debounced auto-save, saving/saved indicator, error handling                                 |
| **DONE** | Progress tracking — per-section completion percentage and global bar in header                                 |
| **DONE** | HintPanel — expandable hint per card, bilingual, dismissable                                                   |
| **DONE** | Section overview — all 58 cards with done/skipped/pending status and jump-to links                             |
| **DONE** | Resume on login — founder returns to last incomplete card automatically                                        |
| **DONE** | RTL layout for Arabic studies — dir=rtl applied globally when Arabic is selected                               |

### 2.3 PDF Export

| Field | Value |
|----------|---------------------------------------------------------------------------------------------|
| **DONE** | HTML template — 9 pages, A4, paper surface \#FAF7F0, IBM Plex fonts via Google Fonts        |
| **DONE** | Cover page — logo embedded as base64, founder name, startup name, date, language, meta grid |
| **DONE** | All 8 content sections — mono eyebrow labels, structured prose formatting                   |
| **DONE** | Competitor table — 3 columns, repeatable rows rendered as clean comparison table            |
| **DONE** | Team table — 3 columns, same mechanic as competitor table                                   |
| **DONE** | Risk table — 3 columns, High/Medium/Low likelihood pills with semantic colors               |
| **DONE** | Financial projections page — auto-inserted between S4 and S5 when projections are filled    |
| **DONE** | Gold disclaimer banner — auto-injected for skipped mandatory sections                       |
| **DONE** | PDFShift API v3 — X-API-Key auth, A4 format, hosted Chromium rendering                      |
| **DONE** | PDF uploaded to MinIO, signed 1-hour download URL returned to client                        |
| **DONE** | Export record saved to exports table with completion snapshot                               |

### 2.4 Dashboard & Navigation

| Field | Value |
|----------|-------------------------------------------------------------------------------------------|
| **DONE** | Dashboard — study cards with startup name, language badge, completion %, last edited date |
| **DONE** | New study flow — 3-step setup (language, startup name, logo upload)                       |
| **DONE** | Study overview — all sections with progress, jump to any card                             |
| **DONE** | Export access from dashboard — re-download previous exports                               |
| **DONE** | Dark mode — CSS variables on .dark class, toggled by ThemeProvider                        |
| **DONE** | Landing page — full wuduh.site homepage with hero, how it works, export preview, CTA      |

## 3. Card Journey — Full Specification

58 cards across 8 sections plus a cover page. 41 mandatory, 17 optional. All content defined in wuduh-cards.json which is the single source of truth — any change to a card prompt, hint, or example is made there, no code change required.

| **Section** | **Title**             | **Cards** | **Mandatory** | **Notes**                                                                  |
|-------------|-----------------------|-----------|---------------|----------------------------------------------------------------------------|
| Cover       | Cover Page            | 4         | 4             | Language, logo, startup name, founder name                                 |
| S1          | Problem & Opportunity | 7         | 6             | Includes optional trigger card                                             |
| S2          | Solution              | 8         | 6             | Includes optional 'what we don't do' and mockup upload                     |
| S3          | Market Analysis       | 6         | 4             | Includes optional persona and customer validation cards                    |
| S4          | Business Model        | 9         | 5             | Includes 4 projections cards added during build (4.6–4.9)                  |
| S5          | Competitive Landscape | 5         | 5             | 5.1 competitor table, 5.2 positioning, 5.3 switching costs, 5.4 advantage, 5.5 why-now |
| S6          | Go-To-Market          | 6         | 4             | Includes optional traction and partnerships cards                          |
| S7          | Team                  | 6         | 4             | Includes optional advisors and hiring plan cards                           |
| S8          | Risks & Mitigation    | 7         | 5             | Includes card 8.7 — single most important assumption                       |
| TOTAL       |                       | 58        | 41            |                                                                            |

> ⚠ wuduh-cards.json on the desktop is the live production config. It is the same file the running app reads. Never edit it directly on the server — edit the desktop copy and redeploy.

## 4. Tech Stack — As Built

| **Layer**    | **Technology**         | **Where It Lives**                      | **Notes**                                                                |
|--------------|------------------------|-----------------------------------------|--------------------------------------------------------------------------|
| Framework    | Next.js 16.2.9         | Coolify — wuduh app container           | App Router, TypeScript, Turbopack dev                                    |
| Auth         | Better Auth 1.6.19     | src/lib/auth/                           | Email + password, sessions, password reset                               |
| Database     | PostgreSQL 17          | Coolify — postgresql-database container | Self-hosted, internal hostname, wuduh db                                 |
| File storage | MinIO                  | Coolify — wuduh-minio container         | S3-compatible, port 9000 API / 9001 console                              |
| Email        | Resend                 | External API                            | Transactional only — confirm + reset                                     |
| PDF          | PDFShift API           | External API                            | Hosted Chromium, A4, X-API-Key auth                                      |
| Hosting      | Coolify self-hosted    | VPS at 65.21.151.1                      | Docker, rolling updates, 3 containers                                    |
| DNS          | Cloudflare             | wuduh.site                              | A record → 65.21.151.1, DNS only (no proxy)                              |
| Styling      | Tailwind CSS 3.4       | tailwind.config.js                      | CSS variables for design tokens, dark mode                               |
| Fonts        | IBM Plex family        | Google Fonts CDN                        | Serif, Sans, Sans Arabic, Mono                                           |
| Middleware   | Auth guard (per-route) | src/lib/auth/session.ts                 | requireVerifiedUser (pages) + getVerifiedUser (APIs); no middleware file |

### 4.1 Key Files

| **File / Directory**                           | **What It Does**                                                                                                 |
|------------------------------------------------|------------------------------------------------------------------------------------------------------------------|
| wuduh-cards.json                               | Single source of truth for all 58 cards — prompts, hints, examples in Arabic and English                         |
| src/lib/cards/loader.ts                        | Loads and validates card config, returns typed card objects                                                      |
| src/lib/pdf/                                   | HTML template for PDF export — 9 pages, paper surface, all sections                                              |
| src/lib/projections/engine.ts                  | Financial projections calculator — reads 8 existing + 4 new cards, outputs breakeven, MRR, runway                |
| src/components/cards/                          | CardShell, TextCard, TableCard, UploadCard, LangCard, HintPanel, ProjectionsChart                                |
| src/hooks/useAutoSave.ts                       | 800ms debounce auto-save hook used by all card types                                                             |
| src/app/api/studies/                           | CRUD for studies and answers — upsert, completion recalculation                                                  |
| src/app/api/upload/                            | File upload to MinIO — validates type and size, returns storage path                                             |
| db/migrations/003_self_hosted_schema.sql | PostgreSQL schema for production — run once on fresh database                                                    |
| src/lib/auth/session.ts                        | Session + verified-user guards (requireVerifiedUser, getVerifiedUser) used by every protected page and API route |
| Dockerfile                                     | Multi-stage Docker build — builder → runner, standalone output                                                   |

## 5. What Remains

Everything below is not yet built. Items are ordered by urgency — critical fixes must happen before any real user touches the product.

### 5.1 Critical — Resolved

> ✅ All three critical fixes are complete and verified live (June 2026). These no longer block sharing wuduh.site.

| Field | Value |
|-------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **✅ DONE** | Password reset flow — FIXED. Better Auth 1.6.19 renamed the endpoint, so the client now calls requestPasswordReset (/request-password-reset) and a sendResetPassword callback was added to auth.ts. Tested end to end in production: the email arrives and the link resets the password. |
| **✅ DONE** | Email confirmation — ENFORCED. sendOnSignUp enabled and autoSignIn disabled, so no session is issued before verification. Access is gated by requireVerifiedUser() on protected pages and getVerifiedUser() on API routes. Verified live: an unverified user cannot reach the dashboard. |
| **✅ DONE** | PDF background color rendering — FIXED. Added print-color-adjust: exact (and an @page A4 rule) so the navy header and paper surface \#FAF7F0 render correctly in the PDFShift output. Verified.                                                                                          |

### 5.2 Pre-Launch — Must Have Before Revenue

| Field | Value |
|-------------|------------------------------------------------------------------------------------------------------------|
| **PENDING** | Moyasar payment integration — SAR 99 per export. MADA + Visa. SAMA-compliant. No revenue until this ships. |
| **PENDING** | www.wuduh.site subdomain — DNS record not yet configured. Only wuduh.site (no www) works.                  |
| **PENDING** | Card C2 startup name sync — should update studies.startupName on answer save, not only at export time.     |

### 5.3 Next Feature Phases — In Order

These are post-launch V2 features. Do not start any of these until the critical and pre-launch items above are resolved and the first real users are through the product.

| **Phase** | **Feature**                | **What It Does**                                                                                                          | **Priority** |
|-----------|----------------------------|---------------------------------------------------------------------------------------------------------------------------|--------------|
| V2        | Theme gallery              | Founder chooses from multiple export design themes — different layouts and visual styles                                  | High         |
| V2        | Designer marketplace       | Connect founder to a real designer for custom export theme — Wuduh takes commission                                       | High         |
| V2        | Accelerator white-labeling | Accelerator logo and brand colors on the export — unlocks higher B2B pricing                                              | High         |
| V2        | Living document            | Founder returns and updates study as startup evolves — version history, changelog                                         | Medium       |
| V2        | Edge-level JWT auth guard  | Add an edge middleware layer to validate the session without a DB call — technical hardening (no middleware exists today) | Medium       |
| V3        | Investor shareable link    | Live URL the founder shares instead of a PDF — always current, no email attachment                                        | Later        |
| V3        | Documentation hub          | Ongoing founder workspace — decisions, pivots, meeting notes, milestones beyond the study                                 | Later        |
| V3        | GCC expansion              | UAE, Kuwait, Bahrain — same product, regional marketing                                                                   | Later        |
| V3        | Accelerator API            | Embed Wuduh into existing accelerator platforms via API — meet them where they are                                        | Later        |

### 5.4 Final Phase — Payment System

> ★ Payment is intentionally sequenced last. Monetization switches on only after the product depth is complete and real users have validated the value.

| Field | Value |
|-------------|-----------------------------------------------------------------------------------------------------|
| **PENDING** | Moyasar integration — SAR 99 per export, MADA + Visa, 2.9% + SAR 1.12 per transaction, no setup fee |
| **PENDING** | Accelerator cohort billing — SAR 3,000 per cohort, invoice or card payment                          |
| **PENDING** | Export gate — export blocked until payment confirmed, PDF released on success                       |

### 5.5 Last on the Roadmap — AI Input Validator

> ℹ This is deliberately the final item. It adds no value if the product has not been validated by real users first. On-device inference — no server cost, no external dependency.

| Field | Value |
|-----------|-------------------------------------------------------------------------------------------------------|
| **LATER** | Real-time flagging — as founder types, weak or contradictory inputs are highlighted with a suggestion |
| **LATER** | Contradicting evidence — if market size claim is unrealistic, surfaces a reference data point         |
| **LATER** | Positive confirmation — when inputs are strong, confirms and optionally adds supporting context       |
| **LATER** | On-device inference — planned as in-browser model, no per-use server cost, no external API dependency |

## 6. Validation — Not Done Yet

> ⚠ The product is built but has not been shown to a real founder or accelerator. Validation is the most important next step after the critical fixes.

| **Who**                      | **How Many** | **What to Show**                                   | **What to Ask**                                                                  |
|------------------------------|--------------|----------------------------------------------------|----------------------------------------------------------------------------------|
| First-time Saudi founders    | 5            | Live product at wuduh.site — complete a real study | Where do you hesitate? Would you pay SAR 99 to export? Would you recommend this? |
| Accelerator program managers | 3            | Pitch deck + live product + PDF export sample      | How do your founders currently prepare? Would you pay SAR 3,000 per cohort?      |
| Saudi angel investors        | 1–2          | A completed PDF export from a real study           | Would you take a study that looked like this seriously?                          |

### 6.1 Where to Find Them

- Founders — Twitter/X Saudi startup community, Indie Hackers, LinkedIn, Flat6Labs applicant network

- Accelerator managers — Monshaat website, Flat6Labs LinkedIn, KAUST Entrepreneurship page, direct email

- Investors — introductions through accelerator contacts, Saudi angel investor networks on LinkedIn

## 7. Document Inventory

All project documents. v2 versions are the most current. v1 versions are preserved for historical reference and original design thinking.

| **File**                              | **Version** | **Status**         | **What It Contains**                                             |
|---------------------------------------|-------------|--------------------|------------------------------------------------------------------|
| wuduh-cards.json                      | Live        | Current — 58 cards | All card content, bilingual, production config                   |
| README.md                             | Live        | Current            | Stack, setup, structure, roadmap summary                         |
| Documents/wuduh-documentation-v2.docx | v2          | Current            | Product documentation reflecting built state                     |
| Documents/wuduh-brd-v2.docx           | v2          | Current            | BRD updated to reflect actual build                              |
| Documents/wuduh-dev-plan-v2.docx      | v2          | Current            | Development plan updated post-build                              |
| Documents/wuduh-pitch-deck.pptx       | v1          | Needs update       | Pitch deck — still references 52 cards and Supabase/Vercel stack |
| Documents/wuduh-documentation.docx    | v1          | Historical         | Original product documentation — design-phase thinking           |
| Documents/wuduh-brd.docx              | v1          | Historical         | Original BRD — full technical specification as designed          |
| Documents/wuduh-dev-plan.docx         | v1          | Historical         | Original development plan — 8-week MVP roadmap                   |
| Wuduh App.html                        | v1          | Historical         | Interactive card UI prototype — 52 cards, pre-build              |
| wuduh-landing-page.html               | v1          | Reference          | Landing page design prototype                                    |
| wuduh-pdf-export-template.html        | v1          | Reference          | PDF export template design prototype                             |
| THIS DOCUMENT — wuduh-master.docx     | v3          | Current            | Single source of truth — supersedes all above                    |

> ⚠ The pitch deck needs to be updated before any investor or accelerator meeting. Card count changed from 52 to 58. Stack changed from Supabase/Vercel to Coolify/PostgreSQL/MinIO. Financial projections engine was added.

## 8. Key Decisions Log

Every major decision that shaped the product, in chronological order. This is the institutional memory of the project.

| **Decision**                        | **What Was Decided**                                                                          | **Why**                                                                                                                                                                                                           |
|-------------------------------------|-----------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| B2B2C model                         | Sell to accelerators, serve founders                                                          | First-time founders are the hardest customer to monetize directly. Accelerators have budget and cohorts.                                                                                                          |
| Founder-owned data                  | No AI-generated content — ever                                                                | Investors recognize AI output. A study from the founder's own thinking is more credible and defensible.                                                                                                           |
| Card mechanic                       | Swipe right to complete, swipe left to skip                                                   | Removes blank page anxiety. One question at a time is psychologically easier than a full form.                                                                                                                    |
| Arabic-first                        | Full RTL native experience, not a translation                                                 | No Arabic-first feasibility study tool exists. This is the primary market differentiator.                                                                                                                         |
| Language at C0                      | First card sets language for everything                                                       | All subsequent cards, hints, and the export follow the choice made at card C0.                                                                                                                                    |
| Hints as onboarding                 | No separate tutorial — hints guide in context                                                 | Founders learn what investors want while answering, not before. Context-first onboarding.                                                                                                                         |
| Cards never limit                   | All inputs are open text — no dropdowns for substantive answers                               | A dropdown would limit unconventional founders and contradict the founder-owned data principle.                                                                                                                   |
| MVP scope                           | Card journey + auto-save + PDF export only                                                    | Validate the core before building V2 features. Ship fast, learn from real users.                                                                                                                                  |
| Supabase → Coolify                  | Migrated from Supabase/Vercel to self-hosted Coolify stack                                    | Control, cost, and no vendor lock-in. PostgreSQL + MinIO on own VPS.                                                                                                                                              |
| Payment sequenced last              | Moyasar integration is the final pre-AI feature                                               | Monetization switches on only after product depth is complete and users have validated value.                                                                                                                     |
| AI validator last                   | On-device inference, deferred after payment                                                   | No server cost. No external dependency. Only valuable after real users confirm the core product works.                                                                                                            |
| 58 cards not 52                     | 6 cards added during build — 4 projections, 2 competitive                                     | Financial projections engine added in Phase B. Two competitive landscape cards added for depth.                                                                                                                   |
| PDFShift not Puppeteer              | External API for PDF generation                                                               | Hosted Chromium removes serverless complexity and cold start issues. Pay per conversion.                                                                                                                          |
| Verify at the guard, not the config | Gate access on emailVerified at page guards and API routes, not just session existence        | requireEmailVerification only blocks the sign-in API. autoSignIn still issued a session at signup, so the real boundary is checking verified status where data is accessed.                                       |
| Card 4.6 milestone ramp             | Founders enter only milestone months; the engine interpolates and carries forward to month 12 | Twelve fixed rows were tedious and left blanks the engine read as zero customers, producing nonsense metrics (MRR month 12 = 0). Milestone entry plus interpolation matches how recurring revenue actually ramps. |
| No middleware file                  | proxy.ts removed; route protection moved to per-page and per-API guards                       | proxy.ts was removed and not replaced. Auth is enforced in server components (requireVerifiedUser) and API routes (getVerifiedUser) via Better Auth getSession, which is sufficient without a middleware layer.   |
| Trigger aligned to schema           | handle_new_user() writes to profiles.fullName (camelCase)                                     | A Supabase-era trigger inserted into full_name (snake_case), a column that does not exist in the camelCase schema, which blocked every signup. The trigger was corrected to the real column.                      |

Wuduh — Master Status Document v3.0 — June 2026 — Single Source of Truth
