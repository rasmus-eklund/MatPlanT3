@RTK.md

# MatPlan AI Agent Guidelines

## Project Overview

MatPlan is a Swedish meal planning and grocery optimization web application. It allows users to plan weekly menus, generate optimized shopping lists based on store layouts, and manage recipes.

## Tech Stack

- **Package manager**: Bun. Use `bun`, never `npm`, `pnpm`, or `yarn`.
- **Framework**: Next.js (App Router)
- **Language**: TypeScript (Strict)
- **Database**: PostgreSQL (via Drizzle ORM)
- **Styling**: Tailwind CSS v4 (Config in CSS via `@theme`), Radix UI primitives
- **State Management**: Zustand
- **Auth**: Kinde
- **Search**: Meilisearch
- **Testing**: Bun (test runner), Docker Compose (test database)

## Critical Development Rules

### 1. Architecture

- Follow existing project patterns instead of introducing new architectural styles.
- Keep changes minimal and focused on the requested task.
- Avoid unrelated refactoring.
- Prefer Server Components by default. Only use Client Components when browser APIs, React hooks, or interactivity require them.
- Prefer Server Actions over creating new API routes when appropriate.

### 2. UI & Styling (Tailwind v4)

- **Configuration**: Do not look for `tailwind.config.js`. Theme extensions and custom values are defined in `global.css` using `@theme` blocks.
- **Components**: Use **Radix UI** primitives (`@radix-ui/react-*`) and **shadcn/ui** patterns (e.g. `cn()` with `clsx`/`tailwind-merge`) for interactive components.
- **Optimization**: React Compiler (`babel-plugin-react-compiler`) is enabled. Do not add `useMemo`, `useCallback`, or `React.memo` for performance optimization unless stable object identity is required or profiling demonstrates a need.

### 3. Database & ORM (Drizzle)

- Use `drizzle-orm` for all database queries.
- Do not create or edit migration files unless explicitly requested. The project uses `db:push` during development instead of generated migrations.

### 4. State Management

- Prefer **Zustand** (`zustand`) for complex client-side state.

### 5. Search

- Use Meilisearch for recipe and ingredient search.

### 6. Code Quality

- Run `bun run lint`.
- Run `bun run type-check`.
- Run `bun run format`.

## Core Features & Logic

1. **Menu Planning (`Meny`)**: Users assign recipes to days. Portion scaling is supported. Nested recipes (recipes containing other recipes) must resolve recursively.
2. **Recipe Management (`Maträtter`)**: Search by name/ingredients (via Meilisearch), import from Swedish sites, and share/copy recipes.
3. **Shopping List (`Inköpslista`)**: Aggregates ingredients from the weekly menu. Items can be manually added or marked as "already at home."
4. **Store Optimization (`Butiker`)**: Users define and save store layouts. The shopping list sorts items to match the selected store layout.

## Development Workflow

- **Schema Changes**: The user can run `db:push:test` to push schema changes to the test database.
- **Tests**: Always use `bun run test`. Do not invoke `bun test` directly because the script configures the correct environment and Docker Compose services.
- **Dependencies**: Prefer existing project dependencies. Do not introduce new libraries unless explicitly requested.

## Common Commands

```bash
bun install
bun run dev
bun run lint
bun run type-check
bun run test
bun run format
```
