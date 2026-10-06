# AGENTS.md

App de registro de gastos personales y de Carpintería El Roble. Next.js 16 App Router + TypeScript.

> **Estado:** en migración desde un prototipo (`localStorage`) hacia Supabase. `app/page.js` es el prototipo **temporal** y se reemplaza por el dashboard real. La lógica de dominio ya vive tipada en `lib/`.

## Comandos

- `npm install` (usa `package-lock.json`; las deps están pineadas a versiones exactas)
- `npm test` → Vitest (tests de la lógica de importes). `npm run test:watch` para modo interactivo.
- `npm run dev` → http://localhost:3000
- `npm run build` / `npm start`
- `npm run typecheck` → `tsc --noEmit`
- Hay tests y typecheck, pero **no hay lint ni CI**. Para cambios de UI, la verificación sigue siendo manual en el navegador.
- **Requiere Node ≥ 20.9** (Next 16 lo exige). El `node` del sistema es v18 y NO sirve: hay un Node 22 LTS en `~/.local/share/node/bin` que se agrega al PATH desde `~/.zshrc`. Si `npm` falla con `EBADENGINE`, es que estás usando el Node viejo.

## Arquitectura (no busques más de lo que hay)

- `app/page.js` es el prototipo cliente (`'use client'`) que se está reemplazando. `app/layout.tsx` es el layout raíz; `app/globals.css`, la única hoja de estilos.
- `lib/` es la capa de dominio tipada, sin React:
  - `types.ts` → `Scope`, `PaymentMethod`, `ExpenseOrigin`, `Expense`, `ExpenseInput`.
  - `categories.ts` → **fuente única** de ámbitos, categorías/subcategorías, medios de pago y orígenes, con sus etiquetas en español.
  - `format.ts` → `money()` y `parseAmount()`.
- Persistencia actual del prototipo: `localStorage` clave `gastos-v1`. **El destino es Supabase** (Postgres + RLS); no agregues features nuevas sobre `localStorage`.
- `lib/supabase/` → clientes de Supabase:
  - `client.ts` → navegador (`createBrowserClient`).
  - `server.ts` → Server Components/Actions/Route Handlers (`createServerClient` + `cookies()`).
  - `proxy.ts` → `updateSession()`; lo invoca el `proxy.ts` de la raíz.
  - `env.ts` → `requireEnv()`. **Usá siempre acceso estático** `process.env.NEXT_PUBLIC_X`; el acceso dinámico no se inlinea en el cliente.
- Todavía no hay `components/` ni API routes.

## Supabase / entorno

- Variables (`.env.example`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. El `.env.local` está gitignored. **Nunca** metas `service_role`.
- **Next 16 renombró `middleware.ts` → `proxy.ts`** y exporta `proxy()`. No crees `middleware.ts`.
- Autenticación: email + OTP de 6 dígitos (`signInWithOtp` / `verifyOtp`). La sesión vive en cookies vía `@supabase/ssr`, nunca en `localStorage`.
- RLS es la fuente de verdad de la seguridad; el frontend no decide permisos.

## Trampas específicas

- La cascada ámbito → categoría → subcategoría se define en `lib/categories.ts`. Agregar o renombrar categorías se hace **ahí**. (El prototipo `page.js` todavía tiene su propio `CATS` inline: es legado, se borra con el prototipo.)
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
