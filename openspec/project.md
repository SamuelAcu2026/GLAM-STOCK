# Glam Stock — Project Context

## What it is
Basic stock/inventory control system for a cosmetics business (nail supplies, makeup,
tools such as cabins, etc.). Products and supplies are loaded individually and shown as
e-commerce-style cards.

## Stack
- **Framework:** Next.js (App Router) + React + TypeScript
- **Database:** PostgreSQL (isolated Docker container, port 5433) via Prisma ORM
- **Mutations:** Next.js Server Actions
- **Styling:** Tailwind CSS + shadcn/ui components; design decisions guided by the
  `ui-ux-pro-max` skill (installed at `.claude/skills/ui-ux-pro-max`)
- **Animation:** `motion` (formerly framer-motion)

## Conventions
- Code identifiers and types are English. UI copy is **Spanish** (business is Spanish-speaking).
- **Short Spanish explanatory comments** on important parts only (functions, routes, Server
  Actions, key logic) — enough to explain what each important piece is for. No over-commenting.
- **Navigation is a header menu (top nav), NOT a lateral sidebar.**
- SDD artifacts live under `openspec/`.

## Infrastructure notes
- Host port 5432 is already in use by another service; this project's Postgres container
  publishes on **5433** to avoid the conflict.
