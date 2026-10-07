# AGENTS.md

App de registro de gastos personales y de Carpintería El Roble. Next.js 16 App Router + TypeScript.

> **Estado:** autenticación funcionando con Supabase (magic link). Persistencia de gastos y dashboard: próximas fases. La seguridad real está en RLS.

## Comandos

- `npm install` (usa `package-lock.json`; las deps están pineadas a versiones exactas)
- `npm test` → Vitest (tests de la lógica de importes). `npm run test:watch` para modo interactivo.
- `npm run dev` → http://localhost:3000
- `npm run build` / `npm start`
- `npm run typecheck` → `tsc --noEmit`
- Hay tests y typecheck, pero **no hay lint ni CI**. Para cambios de UI, la verificación sigue siendo manual en el navegador.
- **Requiere Node ≥ 20.9** (Next 16 lo exige). El `node` del sistema es v18 y NO sirve: hay un Node 22 LTS en `~/.local/share/node/bin` que se agrega al PATH desde `~/.zshrc`. Si `npm` falla con `EBADENGINE`, es que estás usando el Node viejo.

## Arquitectura (no busques más de lo que hay)

- Rutas (`app/`):
  - `page.tsx` → dashboard, Server Component. Sin sesión redirige a `/login` (gate con `auth.getClaims()`).
  - `login/page.tsx` + `login/login-form.tsx` → login por magic link.
  - `auth/confirm/route.ts` → callback del magic link: `verifyOtp({ token_hash, type })`.
  - `auth/signout/route.ts` → logout (POST).
  - `layout.tsx` (raíz) y `globals.css` (única hoja de estilos).
- `lib/` es la capa de dominio tipada, sin React:
  - `types.ts` → `Scope`, `PaymentMethod`, `ExpenseOrigin`, `Expense`, `ExpenseInput`.
  - `categories.ts` → **fuente única** de ámbitos, categorías/subcategorías, medios de pago y orígenes, con sus etiquetas en español.
  - `format.ts` → `money()` y `parseAmount()`.
  - `dates.ts` → helpers de mes (`monthOf`, `monthRange`, `addMonths`, `lastMonths`, `monthLabel`). El mes **no** se almacena: se deriva de `expense_date`.
  - `expenses.ts` → **toda** la data access de gastos (`listExpenses`, `getExpense`, `createExpense`, `updateExpense`, `deleteExpense`, `getMonthSummary`, `getMonthlyTrend`, `getComparison`) + validación `zod` (`expenseInputSchema`) + agregaciones puras testeables (`aggregateMonth`, `buildTrend`, `buildComparison`). **No pongas queries de Supabase dentro de componentes**: usá estas funciones pasándoles el cliente.
- `lib/supabase/` → clientes de Supabase:
  - `client.ts` → navegador (`createBrowserClient`).
  - `server.ts` → Server Components/Actions/Route Handlers (`createServerClient` + `cookies()`).
  - `proxy.ts` → `updateSession()`; lo invoca el `proxy.ts` de la raíz.
  - `env.ts` → `requireEnv()`. **Usá siempre acceso estático** `process.env.NEXT_PUBLIC_X`; el acceso dinámico no se inlinea en el cliente.
- Sin `localStorage`: la sesión vive en cookies y los datos van a Supabase.
- `components/` → UI en cliente. `expenses-section.tsx` orquesta form + lista (estado de edición); `expense-form.tsx`; `expense-list.tsx`.
- `app/actions/expenses.ts` → **Server Actions** (`saveExpense`, `removeExpense`). Validan server-side (zod vía `lib/expenses.ts`) y llaman `revalidatePath('/')`. Las mutaciones **no** se hacen directo desde el cliente a Supabase.
- Todavía no hay dashboard de totales/categorías/evolución (FASE 6) ni filtros/búsqueda (FASE 7).

## Supabase / entorno

- Variables (`.env.example`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. El `.env.local` está gitignored. **Nunca** metas `service_role`.
- **Next 16 renombró `middleware.ts` → `proxy.ts`** y exporta `proxy()`. No crees `middleware.ts`.
- Autenticación: **magic link**. `signInWithOtp` (cliente) → email → link a `/auth/confirm?token_hash=…&type=email` → `verifyOtp`. La sesión vive en cookies vía `@supabase/ssr`, nunca en `localStorage`.
- Para verificar identidad usar **`auth.getClaims()`** (verifica la firma del JWT). **NUNCA** `getSession()` para autorizar.
- El template de "Magic Link" en Supabase **debe** apuntar a `/auth/confirm` con `{{ .TokenHash }}` (el flujo PKCE de `@supabase/ssr` no lee la sesión del fragmento de URL). Requiere SMTP propio (Resend) o Pro para editar templates.
- RLS es la fuente de verdad de la seguridad; el frontend no decide permisos.

## Trampas específicas

- La cascada ámbito → categoría → subcategoría se define en `lib/categories.ts`. Agregar o renombrar categorías se hace **ahí**.
- Los ámbitos se guardan en minúscula y **valores estables**: `personal`, `carpinteria`, `father`, `other`. Las etiquetas en español ("Personal", "Carpintería El Roble") son sólo de presentación. No compares por etiqueta.
- El parseo de importes vive en `lib/format.ts` (`parseAmount`) y está cubierto por `lib/format.test.ts`. Regla **es-AR**: el último separador manda como decimal y un punto con exactamente 3 dígitos detrás se toma como miles. **No lo reemplaces por `parseFloat`** ni borres los tests: el bug histórico convertía `"1.5"` en `15`.
- UI, montos y fechas en **es-AR / ARS** (`Intl.NumberFormat('es-AR', {currency:'ARS'})`). Los textos visibles van en español.
- Los IDs de gasto se generan con `crypto.randomUUID()`.

## Git

- Rama de trabajo: `main`. Commits en estilo conventional (`feat:`, `fix:`).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
