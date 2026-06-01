# HADIR — Absensi Mentor & Pendamping

## Stack
- **Next.js 14** (App Router) + TypeScript 5.9
- Tailwind CSS 3.4 + shadcn/ui (New York style, 40+ components)
- **Neon PostgreSQL** — all data + auth (no Firebase)
- Framer Motion, Recharts, Lucide icons, date-fns, jsPDF
- Deployed on **Vercel** (Hobby plan)

## Commands
| Command | What it does |
|---|---|
| `npm run dev` | Dev server on port **3000** |
| `npm run build` | `next build` |
| `npm run start` | Production server |
| `npm run lint` | ESLint via `next lint` |

No tests configured.

## Key architecture
- Entry: `src/app/layout.tsx` → `src/app/page.tsx`
- **All data via Neon PostgreSQL** through API routes (`/api/db`, `/api/auth`)
- Auth uses **session tokens** (stored in `sessions` table) + `crypto.scryptSync` password hashing
- Roles: `admin`, `mentor`, `pendamping` — navigation items filtered by role.
- Login is the only public page; all other routes in `(main)` group require auth.

## Database tables (Neon PostgreSQL)
- `users` — uid, email, name, password_hash, role, created_at
- `sessions` — token, user_id, expires_at
- `schedules` — schedule_id, title, date, time, location (JSONB), mentor_id, status
- `attendances` — attendance_id, userId, type, selfie_url (base64), log, timestamp, location (JSONB), status
- `daily_logs` — log_id, userId, date, entries (JSONB), checkIn/Out, status
- `leaves` — leave_id, userId, date, type, reason, attachment_url, status
- `assignments` — assignment_id, userId, dateStart/End, location (JSONB), description
- `config` — id, lat, lng, radius, name

## Structure
```
src/
  app/
    layout.tsx             Root layout + Providers
    page.tsx               Root redirect
    providers.tsx          AuthProvider wrapper
    globals.css            Tailwind + custom styles
    login/page.tsx
    (main)/layout.tsx      Protected layout + sidebar
    (main)/dashboard/page.tsx
    (main)/attendance/page.tsx
    (main)/daily-log/page.tsx
    (main)/mentor-schedule/page.tsx
    (main)/requests/page.tsx
    (main)/verification/page.tsx
    (main)/reports/page.tsx
    (main)/settings/page.tsx
    (main)/users/page.tsx
    (main)/assignments/page.tsx
    api/db/route.ts        CRUD API (all data operations)
    api/auth/route.ts      Auth API (login, register, me, logout)
    api/generate-pdf/route.ts   PDF generation
  components/
    AppLayout.tsx          Sidebar + mobile nav
    ui/                    shadcn components (40+)
  contexts/
    AuthContext.tsx         Auth context (calls /api/auth)
  lib/
    db.ts                  Neon connection helper
    services/
      auth-service.ts       Session-based auth functions
      api-service.ts        CRUD fetch helpers for /api/db
      upload-service.ts     Image processing (base64 only)
    compress-image.ts       Client-side image compression
    haversine.ts            Distance calculation for geofencing
    utils.ts                cn() helper
  types/
    index.ts               Type definitions
  hooks/
    use-mobile.ts          Mobile detection
```

## Conventions
- **Path alias**: `@/` → `src/`
- **UI imports**: `import { Button } from '@/components/ui/button'`
- **Theme**: Custom dark theme (`#0A0F1C` bg, `#FBBF24` gold accent). Not class-based dark mode.
- **All pages are `'use client'`** — the app is interactive-heavy.
- **`components.json`**: shadcn config — `"style": "new-york"`, `"rsc": false`

## Setup steps (before running)
1. Create a Neon project at https://console.neon.tech
2. Run `schema.sql` in the Neon SQL Editor to create tables
3. Copy Neon connection string to `.env.local` as `DATABASE_URL`
4. Register the first admin user via the app's login page (auto-detects empty DB)
5. Run `npm run dev`

## Notable quirks
- `tsconfig.json` uses `"jsx": "preserve"` for Next.js (not `"react-jsx"`)
- Auth uses **session tokens** stored in `localStorage`; token is sent as `Authorization: Bearer` header
- Password hashing uses **`crypto.scryptSync`** (Node.js built-in, zero deps)
- First registered user automatically becomes admin (no existing users check)
- Images stored as **base64** in TEXT columns (no external storage)
- **Geofencing** uses Haversine formula client-side; checks distance from office/assignment location
- PDF generation via **jsPDF** on **API route** `/api/generate-pdf` (POST)
- `next.config.js` sets `output: 'standalone'` for Vercel + custom image domains
- PWA manifest at `/manifest.json` (icons placeholder — replace with real icons)
- All `'use client'` pages because of heavy interactivity (framer-motion, camera, geolocation)
