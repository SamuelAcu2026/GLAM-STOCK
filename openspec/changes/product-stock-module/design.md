# Design: Product Stock Module

## Architecture overview
Next.js **App Router** with **Server Components** for reads and **Server Actions** for
writes, talking to **PostgreSQL via Prisma**. No separate API layer — Server Actions are the
mutation boundary. Styling with **Tailwind + shadcn/ui**; visual direction from the persisted
design system (`design-system/glam-stock/MASTER.md`). Card entrance/hover polish with
**`motion`**.

```
Browser ──(render)── Server Component (page) ──(Prisma query)── PostgreSQL
   │
   └──(form submit)── Server Action ──(Prisma write + sharp image)── PostgreSQL + public/uploads
```

## Tech decisions

### Database & ORM
- PostgreSQL in an **isolated Docker container on host port 5433** (5432 is taken).
- Prisma as ORM + migration tool. Single `Product` model.
- `DATABASE_URL="postgresql://glam:glam@localhost:5433/glamstock?schema=public"` in `.env`.

### Prisma schema (Product)
```prisma
enum Category { COSMETICS NAILS MAKEUP TOOLS }

model Product {
  id               String   @id @default(cuid())
  code             String   @unique          // código de producto, único
  name             String
  quantity         Int      @default(0)       // stock disponible
  imagePath        String?                    // ruta del archivo, NO el binario
  description      String?
  costPrice        Decimal  @db.Decimal(12, 2)
  markupPercentage Decimal? @db.Decimal(6, 2) // null si usa precio directo
  salePrice        Decimal  @db.Decimal(12, 2)// siempre materializado
  category         Category
  isActive         Boolean  @default(true)    // activo/inactivo en vez de borrar
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

### Pricing logic (single source of truth)
A pure function `computeSalePrice(costPrice, markupPercentage?, directSalePrice?)` lives in
`src/lib/pricing.ts`. It enforces "exactly one pricing mode" and returns the sale price. Both
the form (live preview) and the Server Action use it — no duplicated math.

### Money formatting
`formatARS(value)` in `src/lib/format.ts` wraps
`new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })` → `$ 1.500,00`.

### Image pipeline
- Upload handled inside the Server Action via `sharp`: resize to max width 800px, re-encode to
  WebP, write to `public/uploads/<cuid>.webp`, store the relative path.
- Rendered with `next/image` (lazy by default, blur placeholder, fixed aspect ratio → no CLS).
- Fallback: pasted URL stored as-is; missing image → neutral placeholder component.

### Validation
`zod` schema shared by the form (client feedback) and the Server Action (authoritative). One
schema, validated on the server no matter what.

## UI structure

### Layout — header menu (NOT sidebar)
`src/components/layout/Header.tsx` — top nav bar with the Glam Stock brand + nav links
(Productos, and room for future modules). Per project convention, navigation lives in the
header; there is no lateral sidebar.

### Pages / routes
| Route | Type | Purpose |
|-------|------|---------|
| `/` | Server Component | redirect → `/productos` |
| `/productos` | Server Component | paginated grid of product cards + green "Cargar producto" button + show-inactive toggle |

Add/Edit use a **shadcn Dialog (modal)** rendered on `/productos` so the user never leaves the
grid — faster perceived flow for a catalog.

### Components
- `ProductGrid` — responsive grid (375/768/1024/1440 breakpoints), paginated 24/page.
- `ProductCard` — image (`next/image`), name, code, stock badge, price (`formatARS`), small
  **edit** button; `motion` for entrance stagger + subtle hover (opacity/scale, 150–200ms).
- `ProductFormDialog` — shared by load & edit; pricing mode switch (percentage ↔ direct price)
  with a live sale-price preview; image upload field.
- `AddProductButton` — the green CTA (`--color-accent #059669`).
- `ActiveToggle` — activate/deactivate control.

### Server Actions (`src/app/productos/actions.ts`)
- `createProduct(formData)` — validate (zod) → process image (sharp) → compute price → insert.
- `updateProduct(id, formData)` — same, for edits; recomputes sale price.
- `toggleProductActive(id)` — flips `isActive`.

Each Server Action calls `revalidatePath('/productos')` so the grid refreshes after a mutation.

## Visual system (from ui-ux-pro-max, verified)
- **Style:** Flat Design (light + dark), no heavy shadows, 150–200ms transitions.
- **Colors:** primary slate `#334155`, **accent/CTA green `#059669`**, bg `#F8FAFC`,
  card `#FFFFFF`, destructive `#DC2626`. Exposed as CSS variables / Tailwind theme tokens.
- **Type:** Rubik (headings) + Nunito Sans (body).
- **Icons:** Lucide (SVG), never emoji.
- **A11y:** contrast ≥ 4.5:1, visible focus rings, keyboard nav, `prefers-reduced-motion`
  respected by `motion` animations.

## Project structure
```
Glam Stock/
├─ docker-compose.yml          # Postgres on 5433
├─ .env                        # DATABASE_URL
├─ prisma/schema.prisma
├─ public/uploads/             # optimized product images
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx            # fonts + Header
│  │  ├─ page.tsx              # → /productos
│  │  └─ productos/
│  │     ├─ page.tsx           # grid (Server Component)
│  │     └─ actions.ts         # Server Actions
│  ├─ components/
│  │  ├─ layout/Header.tsx
│  │  ├─ products/ (ProductGrid, ProductCard, ProductFormDialog, AddProductButton, ActiveToggle)
│  │  └─ ui/ (shadcn)
│  └─ lib/ (prisma.ts, pricing.ts, format.ts, validation.ts)
```

## Risks / tradeoffs
- **Images in `public/uploads/`** are simple and work with `next/image`, but aren't ideal for
  multi-server deploys later. Fine for this stage; migrating to object storage is isolated to
  the image pipeline.
- **Decimal money** via Prisma `Decimal` avoids float rounding bugs — correct for prices.
- **Modal form** keeps the user in-grid; if the form grows large later, promote to a route.
