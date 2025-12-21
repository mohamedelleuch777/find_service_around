# Copilot / AI Agent Instructions

This file contains concise, repo-specific guidance for AI coding agents working on this Next.js project.

Overview
- **Framework:** Next.js (app router) — see [package.json](package.json) for versions.
- **Structure:** UI lives under the `app/` directory (server and client components). Small, focused client components use `'use client'` (e.g. [app/page.tsx](app/page.tsx) and [app/components/site-header.tsx](app/components/site-header.tsx)).
- **Backend:** The repo uses Firebase Admin for server-side operations (`lib/firebase-admin.ts`) and client-side identity requests in `lib/firebase.ts`. There is no `api/` directory in this repo — frontend code calls `/api/*` endpoints (e.g. `fetch('/api/home')`) but those routes are not present here.

Key patterns and conventions
- Firebase Admin initialization is centralized in `lib/firebase-admin.ts`. It prefers a service account (base64 or JSON env) but falls back to ADC. Relevant env vars: `FIREBASE_SERVICE_ACCOUNT_BASE64`, `FIREBASE_SERVICE_ACCOUNT`, `FIREBASE_PROJECT_ID`, `GOOGLE_APPLICATION_CREDENTIALS`.
- Client Firebase identity helpers are in `lib/firebase.ts`. The API key is embedded in the file; calls use `firebaseIdentityRequest(path, payload)`.
- Database access uses `lib/firestore.ts` (`getDb()` → `getFirestore(getAdminApp())`). Use this helper for server-side Firestore calls.
- Auth and tokens: UI components read/write `localStorage` keys such as `idToken`, `refreshToken`, `profileUserId`, and `pendingVerificationEmail` (see [app/components/site-header.tsx](app/components/site-header.tsx)). When adding auth-related features, keep these keys consistent.
- Styling: Many views use inline styles; some pages include local CSS such as `browse/browse-map.css` and `profile/profile-map.css`. Prefer minimal, local edits unless refactoring styles globally.
- Routing/middleware: `middleware.ts` uses a simple passthrough (`NextResponse.next()`) and excludes `_next/static`, `_next/image`, and `favicon.ico` from matching. Keep behavior minimal and avoid side-effectful middleware changes.

Developer workflows
- Run locally: `npm run dev` (starts Next dev server).
- Build: `npm run build` then `npm run start` for production.
- Lint: `npm run lint` (uses `next lint`). There are no tests in the repository.
- Environment: To run server-side Firebase features locally, provide a service account via `FIREBASE_SERVICE_ACCOUNT_BASE64` (base64 JSON) or `FIREBASE_SERVICE_ACCOUNT` (raw JSON) or set `GOOGLE_APPLICATION_CREDENTIALS`.

Integration & external dependencies
- Uses Firebase Admin SDK (`firebase-admin`) for server operations and client-side identity REST calls to `https://identitytoolkit.googleapis.com/v1`.
- Map UI relies on `leaflet` (client-only). Keep map components strictly client-side (`'use client'`).
- Email sending uses `nodemailer` helpers in `lib/email.ts`.

What to look for when making changes
- If modifying server-side logic, prefer using `getAdminApp()` and `getDb()` rather than re-initializing Admin SDK.
- When adding new API routes, prefer `app/api/` (app router) or note that this repo currently lacks an API folder — confirm whether endpoints live in an external service before implementing new `/api/*` routes.
- Preserve `localStorage` keys used by UI when changing auth flows.
- Keep `use client` components minimal and avoid server-only imports in client components.

Examples (quick references)
- Firebase Admin init: [lib/firebase-admin.ts](lib/firebase-admin.ts)
- Client identity helper: [lib/firebase.ts](lib/firebase.ts)
- Firestore access: [lib/firestore.ts](lib/firestore.ts)
- Root UI: [app/page.tsx](app/page.tsx)
- Header / auth UI: [app/components/site-header.tsx](app/components/site-header.tsx)
- Middleware: [middleware.ts](middleware.ts)

If anything in this guide is unclear or you want more detail (examples, missing API stubs, or CI/build commands), tell me which section to expand and I will iterate.
