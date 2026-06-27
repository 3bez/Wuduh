# Wuduh — Development Plan & Execution Roadmap

### v2.0 · June 2026 · As-Built & Forward Plan · Confidential

## 1 Status

The MVP is delivered and live at wuduh.site as of June 2026, built solo by Abdulaziz Alangari in under two weeks of active development.

- 58-card guided journey across 8 sections — all live

- Arabic and English with full RTL support — fonts, layout, PDF, labels

- Professional PDF export, auth, dashboard, auto-save, resume-on-login — all working

## 2 As-Built Stack

This replaces the original Supabase / Vercel specification. The MVP was built on a self-hosted Coolify stack for control and predictable cost.

| **Layer**      | **Technology**                                                     |
|----------------|--------------------------------------------------------------------|
| Framework      | Next.js 16 (App Router, TypeScript)                                |
| Auth           | Better Auth — email + password, email verification, password reset |
| Database       | PostgreSQL 17 — self-hosted on Coolify                             |
| File storage   | MinIO — self-hosted on Coolify, S3-compatible                      |
| Email          | Resend                                                             |
| PDF generation | PDFShift                                                           |
| Hosting        | Coolify — self-hosted on a VPS                                     |
| DNS            | Cloudflare                                                         |
| Domain         | wuduh.site                                                         |

## 3 Execution Roadmap — Forward Plan

**The MVP shipped. The remaining work is sequenced deliberately: monetization (the payment system) comes last, and the AI input validator is the final item after it.**

### Phase A — Near-Term Polish

- Password reset flow — /reset-password and /reset-password/update pages (live and tested)

- Re-enable email confirmation for production

- PDF quality improvement — full background color rendering

- www.wuduh.site subdomain DNS fix

- Edge-level JWT auth guard — later hardening: add an edge middleware to validate the session without a DB call (no middleware/proxy file exists today)

### Phase B — Feature Build

- Financial projections engine — ✅ Delivered (shipped during the MVP build, ahead of this roadmap): interpolated 12-month customer ramp, revenue/cost lines, break-even, month-12 MRR, gross margin and runway — rendered as a live SVG chart in the study UI (sections S4–S8) and an auto-inserted projections page in the PDF export. CAC/LTV metrics still to come.

- Theme gallery — multiple export design themes

- Designer marketplace — connect founders to designers for custom themes, on commission

- Accelerator white-labeling — cohort licensing, B2B flow

- Living document — founder updates the study as the startup evolves, with version history

### Phase C — Later

- Documentation hub — decisions, pivots, milestones beyond the study

- GCC expansion — UAE, Kuwait, Bahrain

- Shareable investor link — live URL instead of PDF only

- API for accelerator integrations

### Phase D — Final Build Phase: Payment System

- Payment integration — Moyasar (MADA support), SAR 99 per export, SAMA-compliant

- Intentionally sequenced last: monetization switches on only after all the feature work above is complete

### Phase E — After Payment: AI Input Validator

- The final item on the roadmap, deferred until payment ships

- Flags weak or contradictory data as the founder types

- Planned as on-device (in-browser) inference — no server cost, no external dependency, no impact on the live site

## 4 Cost Notes — Forward

| **Item**               | **Estimate**          | **Notes**                                    |
|------------------------|-----------------------|----------------------------------------------|
| Hosting (Coolify VPS)  | Fixed monthly VPS     | Runs the app, PostgreSQL, and MinIO together |
| Email (Resend)         | Free tier early       | Covers transactional email at low volume     |
| PDFShift               | Pay per conversion    | Per-export PDF rendering                     |
| Moyasar (Phase D)      | 2.9% + SAR 1.12 / txn | No setup fee — pay per transaction           |
| AI validator (Phase E) | One-time integration  | On-device inference — no per-use server cost |

## 5 Decision Log — Key Changes Since v1

- Migrated off Supabase / Vercel to a self-hosted Coolify stack (Better Auth + PostgreSQL 17 + MinIO) for control and cost.

- Payment moved to the final build phase — it was previously framed as a pre-launch priority.

- AI input validator moved to after payment as the final roadmap item; the planned approach changed to on-device (in-browser) inference to avoid server cost and external dependency.
