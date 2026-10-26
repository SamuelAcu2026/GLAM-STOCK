# Tasks: Product Stock Module

Ordered implementation checklist. Each task is a reviewable work unit.

## 1. Project scaffolding
- [x] 1.1 Init Next.js (App Router, TypeScript, Tailwind, ESLint, `src/`) via `create-next-app`
- [x] 1.2 Install deps: `prisma @prisma/client zod sharp motion` + shadcn/ui + `lucide-react`
- [x] 1.3 Add `docker-compose.yml` (Postgres on host port 5433, volume) + `.env` with `DATABASE_URL`
- [x] 1.4 Bring up Postgres (`docker compose up -d`) and confirm it accepts connections

## 2. Data layer
- [x] 2.1 Write `prisma/schema.prisma` (Product model + Category enum, Decimal money)
- [x] 2.2 Create Prisma client singleton `src/lib/prisma.ts` (Prisma 7 driver adapter)
- [x] 2.3 Run first migration (`prisma migrate dev --name init`) and generate client

## 3. Domain logic (pure, testable)
- [x] 3.1 `src/lib/pricing.ts` — `computeSalePrice()` enforcing exactly-one pricing mode
- [x] 3.2 `src/lib/format.ts` — `formatARS()` es-AR currency (`$ 1.500,00`)
- [x] 3.3 `src/lib/validation.ts` — zod schema shared by form + Server Action

## 4. Design tokens & layout
- [x] 4.1 Wire design tokens into Tailwind theme (colors from MASTER.md, Rubik + Nunito Sans)
- [x] 4.2 `src/components/layout/Header.tsx` — top nav menu (NOT sidebar)
- [x] 4.3 `src/app/layout.tsx` — fonts + Header; `src/app/page.tsx` → redirect `/productos`

## 5. Server Actions
- [x] 5.1 `src/app/productos/actions.ts` — `saveProduct` (validate → sharp image → price → insert)
- [x] 5.2 `saveProduct` update branch (recompute price) + `toggleProductActive`; `revalidatePath` after each

## 6. UI — products module
- [x] 6.1 Green "Cargar producto" CTA (`#059669`) — in `ProductGrid`
- [x] 6.2 `ProductCard` — image (`next/image`), name, code, stock, price, edit button; `motion` hover/entrance
- [x] 6.3 `ProductGrid` — responsive grid, pagination (24/page), show-inactive toggle
- [x] 6.4 `ProductFormDialog` — shared load/edit modal; pricing-mode switch + live preview; image upload
- [x] 6.5 Active toggle — in `ProductCard`
- [x] 6.6 `/productos/page.tsx` — Server Component: fetch + render grid

## 7. Verification
- [~] 7.1 Seeded sample products; read/render persist confirmed. Create/edit/toggle via browser: pending
- [x] 7.2 Spec scenarios verified: both pricing modes, es-AR currency, inactive filter, missing-image placeholder
- [x] 7.3 Lint clean (`npm run lint`); dev build compiles (GET /productos → 200)

## 8. Enhancements (post-first-run, user-requested)
- [x] 8.1 Fix Next 16 `cacheComponents`: `/productos` data in `<Suspense>`; `/` redirect via config
- [x] 8.2 `section` field (free text) + migration; shown on card, filterable
- [x] 8.3 Stock +/- buttons on card → `adjustStock` Server Action (floors at 0)
- [x] 8.4 Section filter dropdown (URL-driven, server-side)
- [x] 8.5 Header search box (debounced, URL `?q=`, server-side name/code match)

## 9. Authentication (production-bound)
- [x] 9.1 Auth.js v5 + Google OAuth, JWT sessions, email allowlist (`src/auth.ts`)
- [x] 9.2 Middleware protects whole app → `/login`; route handler at `api/auth/[...nextauth]`
- [x] 9.3 `/login` page (Google sign-in) + logout in header (hidden on /login)
- [x] 9.4 `requireAuth()` guard in all mutating Server Actions
- [x] 9.5 Env wired (AUTH_SECRET, AUTH_GOOGLE_ID/SECRET, ALLOWED_EMAILS); provider verified
- [ ] 9.6 Browser sign-in test (user) + production hardening (HTTPS, AUTH_URL, prod redirect URI)

## Review Workload Forecast
- Estimated changed lines: **High (> 400)** — this is a greenfield scaffold + full module.
- This is the project's first slice; it is one cohesive feature with no existing code to
  chain against, so it ships as a **single initial delivery** rather than chained PRs.
- Decision needed before apply: confirm single-delivery scaffold is acceptable (it is, for a
  greenfield first module).
