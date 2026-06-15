# Wuduh

Card-based feasibility study builder for first-time founders in Saudi Arabia and the GCC.

## Tech stack

- **Next.js 15** — App router, TypeScript
- **Supabase** — Auth, PostgreSQL, Storage
- **Tailwind CSS** — with Wuduh design tokens
- **Vercel** — hosting and serverless functions

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Open .env.local and paste your Supabase keys

# 3. Run the database migrations
# Open Supabase → SQL Editor → paste contents of supabase/migrations/*.sql in order

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
├── app/
│   ├── (auth)/          # Login, signup, confirm pages
│   ├── dashboard/       # Founder dashboard
│   ├── study/           # Card journey (Phase 2)
│   └── api/             # API routes
├── components/
│   └── ui/              # Shared UI components
├── lib/
│   ├── supabase/        # Supabase client helpers
│   └── utils.ts         # Shared utilities
└── types/
    └── database.ts      # Supabase type definitions
```

## Environment variables

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` locally, `https://wuduh.site` in production |
