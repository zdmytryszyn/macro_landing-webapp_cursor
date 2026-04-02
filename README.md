# MacroTrack

Next.js app for logging meals and tracking daily calories and macros (protein, carbs, fats) against goals. Uses SQLite + Prisma, JWT sessions, and optional FatSecret food search (server-side).

## Scripts

```bash
npm run dev    # development server (http://localhost:3000)
npm run build  # production build
npm run start  # run production server
npm run lint   # ESLint
```

Prisma: `npx prisma migrate dev` / `npx prisma generate` as needed.

## Environment

Set at least:

- `DATABASE_URL` — e.g. `file:./prisma/dev.db`
- `SESSION_SECRET` — long random string for JWT cookies
- `FATSECRET_CLIENT_ID` / `FATSECRET_CLIENT_SECRET` — optional; enables live food search (IP allowlist required in FatSecret console)

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
| `prisma/` | Schema and SQLite migrations. |
| `proxy.ts` | Next.js 16 **proxy** (replaces `middleware`): auth redirects for `/dashboard`, `/login`, `/signup`. |

AI assistants: see `AGENTS.md` for Next.js 16 conventions used in this repo.

## Notes

- **Performance**: App Router keeps server/client boundaries clear; client widgets use `"use client"` only where needed. Heavy UI is code-split per route automatically.
- **Growth**: Add new top-level areas as `app/<segment>/` with colocated `_components/`; keep shared primitives in `components/ui/` and domain logic in `lib/` or `app/api/`.
