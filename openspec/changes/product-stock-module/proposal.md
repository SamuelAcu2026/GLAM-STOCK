# Proposal: Product Stock Module

## Why
Glam Stock needs its first real capability: a module to load and manage the inventory of
products and supplies (cosmetics, nails, makeup, tools like cabins). Without it there is no
way to track what the business has, what it costs, and what it sells for. This module is the
foundation the rest of the system will build on.

## What changes
Introduce a **Products module** that lets the user:

1. **Add a product** individually via a form opened from a prominent **green "Add product"
   button**. Fields captured per product:
   - Product code (unique identifier)
   - Product name
   - Quantity (stock on hand)
   - Image
   - Description
   - Cost price
   - **Pricing**, chosen by the user as ONE of two modes:
     - a **markup percentage** applied over cost price (sale price is derived), OR
     - a **direct sale price** typed by the user (no percentage)
2. **Browse products** as **e-commerce-style cards** in a responsive grid, each card showing
   image, name, code, stock quantity, and sale price.
3. **Edit a product** from a **small edit button on each card** — name, description, price
   (and the other fields).

## Scope
### In scope (first slice)
- Product domain model + PostgreSQL persistence (Prisma).
- Create / read / update products via Server Actions.
- Products grid page with e-commerce cards + green add button + per-card edit.
- Add/Edit product form (modal or dedicated route).
- Pricing logic: percentage-derived sale price OR explicit sale price (exactly one).
- Project scaffolding: Next.js app, Tailwind + shadcn/ui, `motion`, docker-compose Postgres.

### Out of scope (future changes)
- Hard-deleting products, stock movements / history, low-stock alerts.
- Authentication / multi-user / roles.
- Suppliers, purchase orders, sales/checkout.
- Categories management UI (see assumption A3 — a category field may ship, but no admin UI).

## Decisions (confirmed with the user)
- **A1 — Category field:** CONFIRMED. Add an optional **`category`** field (fixed list:
  cosmetics, nails, makeup, tools) so cards can be grouped/filtered later.
- **A2 — Image handling:** Images are **uploaded** to `public/uploads/`, **compressed and
  resized with `sharp`** on upload (max ~800px wide) so stored/served files stay small. They
  are rendered with **`next/image`** (automatic WebP/AVIF, lazy loading, blur placeholder,
  reserved dimensions to avoid CLS). The grid is **paginated** (24 per page). The DB stores
  only the file path. A pasted image URL is accepted as a fallback. This keeps initial page
  load light regardless of catalog size.
- **A3 — Derived vs stored sale price:** When a markup percentage is used, the effective
  **sale price is computed and stored** on save. Both `markupPercentage` and the resulting
  `salePrice` are persisted.
- **A4 — Currency format:** Prices display in **es-AR format** — thousands separator `.`,
  decimal separator `,`, `$ ` prefix. Example: `$ 1.500,00`. Stored as decimal, formatted via
  `Intl.NumberFormat('es-AR', ...)`.
- **A5 — No delete, use active/inactive status:** Products are **never deleted**. Instead each
  product has an **`isActive`** status that can be toggled. Inactive products can be filtered
  out of the main view. Operations in this slice: load (create), read, update, toggle active.
- **A6 — UI language:** User-facing copy is in **Spanish** (the business is Spanish-speaking).
  The add action is labeled **"Cargar producto"** (not "crear"). Code identifiers, types, and
  comments remain in English.

## Impact
- Creates the entire project foundation (first code in the repo).
- New dependency surface: `prisma`, `@prisma/client`, `motion`, shadcn/ui + Tailwind, Docker
  Postgres. All standard, no lock-in risk.
- Establishes the patterns (Server Actions, Prisma access, component structure) every future
  module will follow — so getting this right matters.
