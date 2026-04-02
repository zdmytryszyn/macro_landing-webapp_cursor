# MacroTrack

Next.js app for logging meals and tracking daily calories and macros (protein, carbs, fats) against goals. Uses **PostgreSQL + Prisma**, JWT sessions, and optional FatSecret food search (server-side).

## Scripts

```bash
npm run dev    # development server (http://localhost:3000)
npm run build  # prisma migrate deploy + next build
npm run start  # run production server
npm run lint   # ESLint
```

Prisma: `npx prisma migrate dev` (local) / `npx prisma generate` as needed.

## Environment

Copy `.env.example` to `.env` or `.env.local` and set:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | **Yes** | PostgreSQL connection string (SSL for hosted DBs). |
| `SESSION_SECRET` | **Yes** in production | Long random string used to sign session JWT cookies. |
| `FATSECRET_CLIENT_ID` / `FATSECRET_CLIENT_SECRET` | No | Food search; IP allowlist required in FatSecret console. |

**Local development:** use a free [Neon](https://neon.tech) database (or any Postgres), paste the connection string into `DATABASE_URL`, then run:

```bash
npx prisma migrate dev
npm run dev
```

**Vercel:** In the project → **Settings** → **Environment Variables**, add at least `DATABASE_URL` and `SESSION_SECRET` for **Production** (and **Preview** if you use preview deploys). Redeploy after saving. The build runs `prisma migrate deploy`, which applies migrations to the database you configured.

**Why login failed on Vercel:** Serverless hosting does not use your laptop’s SQLite file. Without `DATABASE_URL`, Prisma cannot connect, so signup/login will fail. A hosted Postgres (Neon, Supabase, etc.) fixes this.

## Project layout

| Path | Role |
|------|------|
| `app/(marketing)/` | Landing route group (URL `/` unchanged). Page-specific UI lives in `_components/`. |
| `app/dashboard/` | Logged-in dashboard; widgets in `dashboard/_components/`. |
| `app/api/` | Route handlers (auth, goals, log entries, dashboard summary, food search, contact). |
| `app/globals.css` | Tailwind v4 + design tokens (active stylesheet). |
| `components/ui/` | shadcn/Radix primitives and shared hooks (`use-toast`, `use-mobile`). |
| `components/theme-provider.tsx` | Theme wrapper (root layout). |
| `lib/` | Auth, Prisma client, Zod schemas, FatSecret client, small helpers (`format-macros`, `utils`). |
| `prisma/` | Schema and PostgreSQL migrations. |
| `proxy.ts` | Next.js 16 **proxy**: auth redirects for `/dashboard`, `/login`, `/signup`. |

AI assistants: see `AGENTS.md` for Next.js 16 conventions used in this repo.

## Notes

- **Performance**: App Router keeps server/client boundaries clear; client widgets use `"use client"` only where needed. Heavy UI is code-split per route automatically.
- **Growth**: Add new top-level areas as `app/<segment>/` with colocated `_components/`; keep shared primitives in `components/ui/` and domain logic in `lib/` or `app/api/`.
