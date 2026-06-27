# WUDUH

وضوح

### Business Requirements Document

*MVP Delivered — Updated to reflect as-built state*

v2.0 · June 2026 · Confidential

## 1 Purpose & Scope — Updated

This BRD was originally a specification for a developer. It has been updated to reflect the as-built state of the Wuduh MVP, which is live at wuduh.site as of June 2026. All MVP scope items have been delivered.

### 1.1 MVP Scope — All Delivered ✅

- ✅ Done — User authentication — signup, login, email confirmation, session persistence

- ✅ Done — Language selection — Arabic (RTL) or English (LTR) at card C0

- ✅ Done — Card journey engine — 58 cards, complete/skip mechanics, auto-save on every action

- ✅ Done — Progress tracking — per-section and global completion percentage

- ✅ Done — Hint system — expandable bilingual hints on every card

- ✅ Done — Logo upload — stored in MinIO object storage, base64-embedded in PDF export

- ✅ Done — Repeatable table inputs — competitors (S5), team (S7), risks (S8)

- ✅ Done — Study export — 9-page PDF via PDFShift hosted Chromium API

- ✅ Done — Incomplete study disclaimer — auto-injected when mandatory cards are skipped

- ✅ Done — Responsive design — desktop 1280px+ and mobile 375px

- ✅ Done — Arabic RTL layout — full right-to-left rendering when Arabic is selected

### 1.2 Out of Scope & Roadmap Order — Updated

- Financial projections engine and charts → ✅ delivered during the MVP build (ahead of plan): live SVG chart in the study UI and an auto-inserted projections page in the PDF export — break-even, month-12 MRR, gross margin, runway. CAC/LTV still to come.

- Theme gallery and designer marketplace → next phase

- Accelerator white-labeling → next phase

- Living document (return-and-update with version history) → next phase

- Edge-level auth guard via JWT session strategy → technical hardening, alongside the next phases

- Investor shareable public link → later

- Multi-user collaboration → later

- Payment system → FINAL build phase — Moyasar (MADA support), SAR 99 per export; intentionally sequenced last, after all other features

- AI input validator → AFTER payment — the final item on the roadmap, deferred until payment ships; planned as on-device (in-browser) inference so it adds no server cost or external dependency

- Native mobile app → Not planned

## 2 As-Built Tech Stack

### 2.1 Frontend

- Next.js 16.2.9 with Turbopack — App router, TypeScript, React 19

- Tailwind CSS 3.4.1 — custom design tokens: navy, gold, teal, slate palettes

- IBM Plex Serif, Sans, Sans Arabic, Mono — all 4 variants, Google Fonts

- Framer Motion 11.18 — installed and available for card animations

- Lucide React 0.511 — icon library throughout

- clsx + tailwind-merge — className utility for conditional styles

### 2.2 Backend

- Next.js API routes — server functions running in the Coolify-hosted Node.js container

- Better Auth 1.6.19 — email + password auth, email verification, password reset, session management

- Auth enforced per-route — requireVerifiedUser() in server components and getVerifiedUser() in API routes (both call Better Auth getSession and require a verified email). No middleware/proxy file; src/proxy.ts was removed.

### 2.3 PDF Export — As Built

- PDFShift API v3 — hosted Chromium service at api.pdfshift.io/v3/convert/pdf

- Auth: X-API-Key header (not Basic auth)

- Parameters: source (HTML string), format (A4), margin (0), landscape (false)

- HTML template: src/lib/pdf/template.ts — 9 pages, full Wuduh design system in CSS

- Logo: fetched via MinIO presigned URL, converted to base64 data URI before sending

- PDF response: raw binary → uploaded to MinIO wuduh-uploads bucket

- Download: 1-hour signed URL returned to client

- Note: Background colors not fully rendering in PDFShift output — improvement pending

### 2.4 Hosting & Infrastructure

- Coolify (self-hosted on VPS) — Docker build from Dockerfile, served on port 3000, auto-deploys on push to main

- Build command: npm run build — TypeScript errors suppressed via next.config.js

- Self-hosted on Coolify — PostgreSQL 17 (port 5432) and MinIO object storage (ports 9000 API / 9001 console), both on the VPS

- Domain: wuduh.site via Cloudflare DNS — A record points to the VPS IP

- GitHub: https://github.com/3bez/Wuduh — main branch, 121 files

## 3 Database Schema — As Built

All tables and triggers are live in the self-hosted PostgreSQL 17 database (wuduh) on Coolify, created by db/migrations/003_self_hosted_schema.sql. All column names use camelCase to match Better Auth conventions. Four Better Auth tables (users, sessions, accounts, verifications) sit alongside the four Wuduh tables below.

| **Table**    | **Primary Key**      | **Key Columns**                                                                              |
|--------------|----------------------|----------------------------------------------------------------------------------------------|
| **profiles** | id (text = users.id) | fullName, preferredLanguage, createdAt, updatedAt                                            |
| **studies**  | id (uuid)            | userId (FK), startupName, language, status, completionPercentage, logoUrl                    |
| **answers**  | id (uuid)            | studyId (FK), cardId (text), answer (JSONB), status (done\|skipped), UNIQUE(studyId, cardId) |
| **exports**  | id (uuid)            | studyId (FK), userId (FK), pdf_url, language, completionSnapshot                             |

### Authorization model

- App-level guards — every protected page and API route calls getUser(); all queries are scoped to the authenticated userId. No database-level RLS (self-hosted Postgres).

- MinIO bucket wuduh-uploads — objects stored under userId/\* paths; access granted only via short-lived presigned URLs issued by the app

### Triggers

- handle_new_user() — auto-creates profiles row on users insert via on_user_created trigger

- set_updated_at triggers — update the camelCase updatedAt column on users, sessions, accounts, profiles, studies and answers on every change

## 4 API Endpoints — As Built

| **M**    | **Route**                         | **Description**                                                                                     |
|----------|-----------------------------------|-----------------------------------------------------------------------------------------------------|
| **GET**  | /api/auth/callback                | Better Auth handler (\[...all\]) + email verification callback (verifies token, sets emailVerified) |
| **GET**  | /api/studies/\[id\]/info          | Returns study language, completionPercentage, startupName, status                                   |
| **POST** | /api/studies/\[id\]/answers       | Insert or update card answer, recalculates and updates completion %                                 |
| **POST** | /api/studies/\[id\]/export        | Builds HTML → calls PDFShift → uploads PDF → returns signed URL                                     |
| **GET**  | /api/studies/\[id\]/export/render | Returns raw HTML for browser-side printing (fallback route)                                         |

## 5 File Structure — As Built

- src/app/(auth)/login/ — login page

- src/app/(auth)/signup/ — signup + email confirmation screen

- src/app/dashboard/ — study cards dashboard

- src/app/study/new/ — creates study, redirects to C0

- src/app/study/\[studyId\]/ — main card journey page

- src/app/study/\[studyId\]/overview/ — section overview with jump links

- src/app/study/\[studyId\]/export/ — export UI page

- src/app/api/auth/\[...all\]/ — Better Auth handler; api/auth/callback/ — email verification callback

- src/app/api/studies/\[studyId\]/answers/ — answer upsert API

- src/app/api/studies/\[studyId\]/export/ — PDFShift export API

- src/app/api/studies/\[studyId\]/export/render/ — browser-print HTML API

- src/app/api/studies/\[studyId\]/info/ — study metadata API

- src/components/cards/ — CardShell, TextCard, TableCard, UploadCard, LangCard, HintPanel

- src/components/ui/ — LogoutButton, StudyProgressBar

- src/hooks/useAutoSave.ts — debounced auto-save hook

- src/lib/cards/loader.ts — card config utilities (getCard, getNextCard, calcCompletion)

- src/lib/pdf/template.ts — HTML template builder (buildPdfHtml)

- src/lib/db/ — PostgreSQL connection pool (pg) and typed query helpers

- src/lib/auth/ — Better Auth config (auth.ts), client (client.ts), session helpers (session.ts: getSession, getUser)

- src/lib/utils.ts — cn(), formatDate(), calcCompletion()

- src/types/database.ts — Study, Answer, Profile TypeScript types

- src/types/cards.ts — CardConfig, SectionConfig, TableColumn types

- Auth guarding — per-route via requireVerifiedUser() (pages) and getVerifiedUser() (API routes) in the Node.js runtime. src/proxy.ts was removed (no middleware file today); an edge-level JWT guard is planned as a later hardening step.

- db/migrations/003_self_hosted_schema.sql — full DB schema, indexes, triggers (the only migration that applies to the current stack)

- wuduh-cards.json — 58 cards, bilingual, all prompts/hints/examples/table configs

*BRD v2.0 — June 2026 — Wuduh MVP Delivered — Confidential*
