# Wuduh — وضوح

Card-based feasibility study builder for first-time founders in Saudi Arabia and the GCC.

## What it does

Founders answer 52 focused cards across 8 sections. When done, Wuduh assembles their answers into an investor-ready feasibility study PDF in Arabic or English.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Auth | Better Auth (email + password, email verification, password reset) |
| Database | PostgreSQL 17 (self-hosted on Coolify) |
| File storage | MinIO (self-hosted on Coolify, S3-compatible) |
| Email | Resend |
| PDF generation | PDFShift |
| Hosting | Coolify (self-hosted on VPS) |
| Styling | Tailwind CSS + CSS variables (design tokens) |
| DNS | Cloudflare |
| Domain | wuduh.site |

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Open .env.local and fill in your values

# 3. Set up the database
# Run supabase/migrations/003_self_hosted_schema.sql in your PostgreSQL instance

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
├── app/
│   ├── (auth)/              # Login, signup, confirm, reset-password pages
│   ├── dashboard/           # Founder dashboard
│   ├── study/
│   │   ├── new/             # 3-step new study setup
│   │   └── [studyId]/       # Card journey, overview, export
│   └── api/
│       ├── auth/            # Better Auth handler + callback
│       ├── studies/         # CRUD for studies and answers
│       ├── upload/          # File upload to MinIO
│       └── contact/         # Contact form (Resend)
├── components/
│   ├── cards/               # CardShell, TextCard, TableCard, UploadCard, HintPanel, LangCard
│   ├── landing/             # Landing page
│   └── ui/                  # LogoutButton, ThemeToggle, ThemeProvider, RenameStudy
├── lib/
│   ├── auth/                # Better Auth config (auth.ts, client.ts, session.ts)
│   ├── cards/               # Card loader and section definitions
│   ├── db/                  # PostgreSQL pool and query helpers
│   └── pdf/                 # PDF HTML template
├── hooks/
│   └── useAutoSave.ts       # Debounced auto-save hook
└── types/
    ├── cards.ts             # Card type definitions
    └── database.ts          # Study, Answer, Profile types
```

## Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Secret key for Better Auth session signing |
| `BETTER_AUTH_URL` | App URL (used for auth callbacks) |
| `NEXT_PUBLIC_APP_URL` | Public app URL |
| `MINIO_ENDPOINT` | MinIO server IP/hostname |
| `MINIO_PORT` | MinIO port (default: 9000) |
| `MINIO_ACCESS_KEY` | MinIO access key |
| `MINIO_SECRET_KEY` | MinIO secret key |
| `MINIO_BUCKET` | MinIO bucket name (default: wuduh-uploads) |
| `RESEND_API_KEY` | Resend API key for transactional email |
| `PDFSHIFT_API_KEY` | PDFShift API key for PDF generation |

## Database schema

The PostgreSQL database (`wuduh`) contains 8 tables:

**Better Auth tables** (camelCase columns):
- `users` — registered accounts
- `sessions` — active sessions
- `accounts` — OAuth / email-password credential links
- `verifications` — email verification tokens

**Wuduh tables** (camelCase columns):
- `profiles` — founder display name and preferences
- `studies` — feasibility studies (userId, startupName, language, completionPercentage, etc.)
- `answers` — card answers (studyId, cardId, answer as JSONB, status)
- `exports` — PDF export history

## Deployment

The app runs on Coolify (self-hosted). Three Docker resources in the `Wuduh / production` environment:

1. **wuduh app** — Next.js app built via Dockerfile, served on port 3000
2. **postgresql-database** — PostgreSQL 17 Alpine, port 5432
3. **wuduh-minio** — MinIO via Docker Compose, ports 9000 (API) and 9001 (console)

Domain `wuduh.site` is managed on Cloudflare DNS pointing to the VPS IP.

## Design tokens

Colors:
- Navy: `#0D1B2A`
- Gold: `#C9A84C`
- Teal: `#0D9488`

Fonts:
- Display: IBM Plex Serif
- Body: IBM Plex Sans
- Mono: IBM Plex Mono
- Arabic: IBM Plex Sans Arabic

Dark mode is implemented via CSS variables on the `.dark` class (toggled by ThemeProvider).

## Card system

52 cards across 8 sections, defined in `wuduh-cards.json` and loaded via `src/lib/cards/loader.ts`.

Card types:
- `text` — free-text textarea with auto-save
- `table` — multi-row structured input (competitors, team members, risks)
- `upload` — image upload to MinIO (logo)
- `lang` — language selection (first card, sets study language)

Each card has English and Arabic translations including prompt, helper text, hint, and example.

## Roadmap

The MVP is delivered and live at wuduh.site. Remaining work is sequenced so that monetization comes last and the AI validator follows it:

1. **Next feature phases** — financial projections engine + export charts, theme gallery + designer marketplace, accelerator white-labeling, living document (return-and-update with version history), investor shareable link, documentation hub, and an accelerator API. Edge-level JWT auth hardening sits alongside these as a technical item.
2. **Final phase — Payment system.** Moyasar (MADA support), SAR 99 per export. Intentionally sequenced last; monetization is switched on once the product depth is complete.
3. **After payment — AI input validator.** The last item on the roadmap, deferred until payment ships. Planned as on-device (in-browser) inference so it adds no server cost or external dependency.
