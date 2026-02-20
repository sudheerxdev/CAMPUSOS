# CAMPUSOS - The Operating System for Students

CAMPUSOS is a production-grade, frontend-only student productivity and placement super-app built with:

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- ShadCN-style component architecture
- Framer Motion
- Recharts
- LocalStorage + IndexedDB
- PWA (installable + offline support)

## Run locally

```bash
npm install
npm run dev
```

## Environment

Create `.env.local` from `.env.example` and set:

```bash
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Build for production

```bash
npm run build
npm run start
```

## Deployment readiness check

```bash
npm run deploy:check
```

## End-to-end smoke tests

```bash
npx playwright install chromium
npm run test:e2e
```

## Core modules included

1. Landing page
2. Unified dashboard
3. Study planner
4. Focus system (Pomodoro)
5. Exam planner
6. CGPA calculator
7. Placement super tracker
8. Competitive programming hub
9. Company preparation kits
10. Resume builder
11. Notes organizer (IndexedDB)
12. Resource hub
13. Goal & habit tracker
14. Settings

## Data model and persistence

- Primary app state is stored in `localStorage` (`campusos.state.v1`).
- Notes are stored in IndexedDB (`campusos-idb` / `notes` store) for robust offline use.

## PWA

- Manifest: `src/app/manifest.ts`
- Service worker: `public/sw.js`
- Offline fallback: `public/offline.html`

## Backup and restore

- Go to `Settings` in the app.
- Use `Export Backup` to download a JSON snapshot.
- Use `Import Backup` to open a restore preview with version compatibility status, then apply restore.

## CI

- Workflow file: `.github/workflows/ci.yml`
- Runs on push to `main` and on pull requests:
  - `npm ci`
  - `npx playwright install --with-deps chromium`
  - `npm run lint`
  - `npm run build`
  - `npm run test:e2e`
  - `npm audit --omit=dev --audit-level=high`

## Deploy on Vercel

1. Import this repo in Vercel.
2. Set environment variable: `NEXT_PUBLIC_APP_URL` to your final production URL.
3. Use default build command: `npm run build`.
4. Use default output directory: `.next`.

Deploy-ready for Vercel.
# CAMPUSOS
