# HealthMate AI Coding Instructions

## Project Architecture

**HealthMate** is a comprehensive healthcare platform built with Next.js 15 + Turbopack, featuring a multi-role system for patients, pharmacies, delivery partners, laboratories, doctors, and admins.

### Core Tech Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Radix UI
- **Backend**: Next.js API routes, NextAuth.js for authentication
- **Database**: SQLite with Prisma ORM
- **External**: Python OCR processing with Emergent LLM integration
## HealthMate — concise AI contributor notes

These are the immediately actionable, repository-specific rules and examples to make an AI coding agent productive here.

- Stack snapshot: Next.js 15 (App Router) + Turbopack, TypeScript, Tailwind, Radix UI, NextAuth (JWT), Prisma + SQLite, Python OCR helper (`ocr_processor.py`). See `package.json` for scripts.

- Authentication: `lib/auth.ts` injects role and related profile objects into `session.user` (patient, pharmacy, deliveryPartner, laboratory, doctor, admin). Always call `getServerSession(authOptions)` in API routes and verify both `session.user.role` and the matching profile (e.g. `prisma.patient.findUnique({ where: { userId: session.user.id } })`). Example: `app/api/prescriptions/process/route.ts`.

- API pattern: API routes live under `app/api/*` and must validate session + profile before DB actions. Use the pattern: check session -> load profile by `userId` -> apply profile-specific `where` filters (patientId/pharmacyId). See `app/api/appointments/route.ts` and `app/api/prescriptions/process/route.ts` for examples.

- OCR integration: Server-side code spawns the Python script (`ocr_processor.py`). Environment notes: the code expects a system Python (script uses `python3` in some places) and requires `EMERGENT_LLM_KEY` for LLM OCR. OCR outputs are stored in `prescription.ocrData` and the prescription file path is in `prescription.filePath` (uploads under `uploads/prescriptions/`). See `app/api/prescriptions/process/route.ts` for fetch-to-internal-API pattern using `NEXTAUTH_URL` and forwarding `Cookie`.

- Database: Prisma schema at `prisma/schema.prisma`. Use `npx prisma db push` after changes and `npx prisma generate`. The code expects SQLite (`DATABASE_URL`). Entities often contain both `userId` and role-specific IDs (e.g., `patientId`) — query accordingly.

- Tests & dev commands: Run dev server with `npm run dev` (Turbopack). Tests use Jest: `npm test`, `npm run test:watch`, and `npm run test:coverage`. Unit/integration tests live in `__tests__/` grouped by feature.

- UI & components: Reusable primitives live in `components/ui/`. Dashboard uses nested layouts under `app/dashboard/` and role-specific pages under `app/dashboard/[role]/`. Sidebar patterns live in `components/dashboard/sidebar.tsx`. Use `lib/utils.ts` (e.g., `cn()`) for Tailwind class composition.

- Inter-service calls: Server code sometimes calls internal API endpoints (fetching `${process.env.NEXTAUTH_URL}/api/...`) and forwards request cookies for auth. When implementing internal API calls prefer using internal function imports when possible; if using fetch, forward `Cookie` header as shown in `prescriptions/process/route.ts`.

- Security & data sensitivity: This repo contains PHI-like data. Always enforce role checks in the API layer (do not rely on client code). Double-check `isApproved` flags for non-patient roles when authorizing actions.

- Helpful file references (examples to read before editing behavior):
  - `lib/auth.ts` — NextAuth setup & session shape
  - `lib/db.ts` — Prisma client
  - `app/api/prescriptions/process/route.ts` — OCR + internal API call pattern
  - `prisma/schema.prisma` — canonical data model
  - `components/dashboard/sidebar.tsx` and `components/search/SearchComponent.tsx` — UI / nav patterns
  - `ocr_processor.py` — Python OCR entrypoint (external LLM integration)

- When modifying APIs: update/add tests in `__tests__/integration` or relevant workflow tests in `__tests__/workflows/` and run `npm test` before opening PR.

If anything here is unclear or you'd like more examples (small code snippets for a common edit), tell me which area to expand and I will iterate.