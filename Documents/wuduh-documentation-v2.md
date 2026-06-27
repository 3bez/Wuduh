# WUDUH

وضوح

### Product Documentation & Development History

*From Idea to Shipped Product — MVP Live at wuduh.site*

v2.0 · June 2026 · Confidential

## 1 Executive Summary

Wuduh is a guided, card-based web application that walks first-time founders in Saudi Arabia and the GCC through building a complete feasibility study — from idea to investor-ready export — using their own data and no AI-generated content.

The MVP is live at wuduh.site as of June 2026. A founder can sign up, complete all 58 cards across 8 sections in Arabic or English, and export a professional 9-page PDF. The entire product — strategy, design, specification, and code — was built by Abdulaziz Alangari.

### Current Product Status

- ✅ Done — Live at wuduh.site — fully deployed

- ✅ Done — 58-card journey — all sections functional

- ✅ Done — Arabic (RTL) and English (LTR) fully supported

- ✅ Done — PDF export — 9-page professional document via PDFShift

- ✅ Done — Dashboard — study management, progress tracking, export access

- ⬜ Planned — Payment integration — Moyasar SAR 99/export

- ✅ Done — Password reset flow

- ✅ Done — PDF background color quality improvement

## 2 The Problem

First-time founders in Saudi Arabia and the GCC face a critical gap when preparing to approach investors or apply to accelerators. They need a structured feasibility study but have no team, no consultant, and no process to produce one.

### Core Pain Points

- No structured process — founders either skip feasibility studies or use generic templates investors dismiss immediately

- Blank page anxiety — starting a business plan from scratch overwhelms first-time founders

- Weak investor readiness — studies that get submitted are generic, unvalidated, and fail to build confidence

- Language gap — every serious tool is English-first and built for Western markets. No Arabic-first feasibility study tool existed before Wuduh.

### Who Has This Problem

- First-time founders preparing to approach an accelerator, investor, or bank

- Typically aged 22–35, pre-revenue, working alone or with a small co-founder team

- Based in Saudi Arabia or the broader GCC region

- Digitally comfortable, Arabic first language, motivated by Vision 2030

## 3 The Solution — What Wuduh Is

Wuduh guides a first-time founder through a structured feasibility study, one card at a time. Every card asks one focused question. The founder answers in their own words with their own data. At the end, the tool exports a professional 9-page PDF document.

### 3.1 Core Mechanic — As Built

- Founder signs up and confirms email → lands on dashboard

- Creates a new study → immediately routed to Card C0 (language selection)

- Picks Arabic or English → RTL or LTR applied globally

- Moves through 58 cards — one at a time — Complete or Skip each card

- Every answer auto-saves on blur (800ms debounce during typing)

- Progress bar in header shows global completion in real time

- Section overview shows all 58 cards with status dots — jump to any card

- Closing and reopening resumes exactly at the last incomplete card

- Export button available at all times — generates 9-page PDF via PDFShift API

### 3.2 The Key Differentiator

The data inside the study comes entirely from the founder. Wuduh does not generate content on their behalf. The tool's role is to structure, format, and present the founder's own inputs as a credible, professional document. This separates Wuduh from AI writing tools — investors are skeptical of AI-generated studies.

### 3.3 Hint System

Every card has an expandable hint panel. The founder taps "Hint" to reveal a plain-language explanation of what the card is asking, why it matters to investors, and a simple example. Available in both Arabic and English. Hints do not appear in the PDF export.

### 3.4 Card Types — As Built

- Open text (TextCard) — textarea with character counter, auto-save on blur and keystrokes

- Repeatable table (TableCard) — used for competitors (S5), team (S7), risks (S8)

- File upload (UploadCard) — logo upload to MinIO object storage, base64-embedded in PDF

- Language selector (LangCard) — C0 only, sets RTL/LTR for the entire study

## 4 The Card Journey — All 58 Cards Live

| **Section**          | **Cards**   | **Topics Covered**                                                                                                         | **Status** |
|----------------------|-------------|----------------------------------------------------------------------------------------------------------------------------|------------|
| **Cover**            | C0–C3 (4)   | Language, Logo, Startup Name, Founder Name                                                                                 | ✅ Live    |
| **S1 — Problem**     | 1.1–1.7 (7) | Overview, Problem, Who, Today's fix, Why it fails, Scale, Trigger                                                          | ✅ Live    |
| **S2 — Solution**    | 2.1–2.8 (8) | One sentence, How it works, Difference, Value prop, Stage, Features, Scope, Visuals/mockups                                | ✅ Live    |
| **S3 — Market**      | 3.1–3.6 (6) | Target customer, TAM/SAM/SOM, Geography, Characteristics, Persona, Validation                                              | ✅ Live    |
| **S4 — Biz Model**   | 4.1–4.9 (9) | Revenue mechanism, Pricing, Price/customer, Costs, Existing revenue, Monthly customers, Fixed costs, Variable cost, Runway | ✅ Live    |
| **S5 — Competitive** | 5.1–5.5 (5) | Competitor table, Unfair advantage, Why now                                                                                | ✅ Live    |
| **S6 — GTM**         | 6.1–6.6 (6) | First 100 customers, Channels, Sales, Year 1, Traction, Partnerships                                                       | ✅ Live    |
| **S7 — Team**        | 7.1–7.6 (6) | Team table, Why this team, Skills we have, Gaps, Advisors, First hires                                                     | ✅ Live    |
| **S8 — Risks**       | 8.1–8.7 (7) | Risk table (likelihood pills), Kill risk, Mitigations, Assumptions, Bet, Plan B, Regulatory                                | ✅ Live    |

## 5 Product Roadmap — Updated

### 5.1 MVP — Delivered June 2026 ✅

- 58-card guided journey across 8 sections — all live

- Arabic and English with full RTL support — covers fonts, layout, PDF, labels

- Professional PDF export — 9 pages, all sections, tables, cover, disclaimer

- Hint system — bilingual expandable panels on every card

- Auto-save — no answer ever lost, debounced on keystrokes

- Resume on login — returns to last incomplete card

- Dashboard — study cards with progress bars and export access

- Deployed on Coolify (self-hosted) — live at wuduh.site

### 5.2 Near-Term Polish

- Password reset flow — /reset-password and /reset-password/update pages (live and tested)

- Re-enable email confirmation for production

- PDF quality improvement — full background color rendering

- www.wuduh.site subdomain DNS fix

- Edge-level JWT auth guard — later hardening: add an edge middleware to validate the session without a DB call (no middleware/proxy file exists today)

### 5.3 Next Feature Phases

- Financial projections engine — ✅ Delivered (shipped during the MVP build, ahead of this roadmap): interpolated 12-month customer ramp, revenue/cost lines, break-even, month-12 MRR, gross margin and runway — live SVG chart in the study UI (sections S4–S8) and an auto-inserted projections page in the PDF export. CAC/LTV metrics still to come.

- Theme gallery — multiple export design themes

- Designer marketplace — connect founders to designers for custom themes

- Accelerator white-labeling — cohort licensing B2B flow

- Living document — founder updates study as the startup evolves

### 5.4 Later

- Documentation hub — decisions, pivots, milestones beyond the study

- GCC expansion — UAE, Kuwait, Bahrain

- Shareable investor link — live URL instead of PDF only

- API for accelerator integrations

### 5.5 Final Phase — Payment System

- Payment integration — Moyasar, SAR 99 per export, MADA / SAMA-compliant

- Intentionally sequenced last: monetization switches on only after all the feature work above is complete

### 5.6 After Payment — AI Input Validator

- The final item on the roadmap, deferred until payment ships

- Flags weak or contradictory data as the founder types

- Planned as on-device (in-browser) inference — no server cost, no external dependency, no impact on the live site

## 6 Development History — How This Was Built

Wuduh was conceived, designed, specified, and built entirely by Abdulaziz Alangari. The following records the key stages that shaped the product.

### Stage 1 — The Original Idea

Card/swipe UX for feasibility studies. Core mechanic: swipe right to complete, swipe left to skip. Product name chosen. Wuduh / وضوح.

### Stage 2 — Customer Focus

Pivot from B2C to B2B2C. Target narrowed to first-time founders. Accelerators identified as the institutional buyer — budget, recurring need, direct access to founders.

### Stage 3 — The Credibility Problem

AI-generated content rejected entirely. Founder's own data only. Wuduh structures and formats — it never generates content on the founder's behalf.

### Stage 4 — 58-Card Journey Design

Full journey designed section by section over multiple sessions. Cover page added as first section. Optional cards introduced. Repeatable table mechanic established for competitors, team, and risks.

### Stage 5 — Saudi Market Focus

Full Arabic RTL support required — a native experience, not a translation toggle. Key Saudi accelerators identified as B2B targets: Monshaat, Flat6Labs, KAUST, Badir.

### Stage 6 — Technical Build (June 2026)

Next.js 16 + Better Auth + self-hosted PostgreSQL 17 + MinIO + Tailwind CSS + IBM Plex, all on Coolify. All 58 cards built and wired to wuduh-cards.json. PDF export via PDFShift API. Dashboard, section overview, auto-save hook all built. Deployed on Coolify (self-hosted) at wuduh.site. Total build time: under 2 weeks of active development.
