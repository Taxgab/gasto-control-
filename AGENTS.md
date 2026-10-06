# AGENTS.md

App de registro de gastos personales y de Carpintería El Roble. Next.js App Router, JavaScript puro.

## Comandos

- `npm install` (usa `package-lock.json`; las deps están pineadas a versiones exactas)
- `npm test` → Vitest (tests de la lógica de importes). `npm run test:watch` para modo interactivo.
- `npm run dev` → http://localhost:3000
- `npm run build` / `npm start`
- Hay tests, pero **no hay lint, typecheck ni CI**. Para cambios de UI, la verificación sigue siendo manual en el navegador.
- **Requiere Node ≥ 20.9** (Next 16 lo exige). El `node` del sistema es v18 y NO sirve: hay un Node 22 LTS en `~/.local/share/node/bin` que se agrega al PATH desde `~/.zshrc`. Si `npm` falla con `EBADENGINE`, es que estás usando el Node viejo.

## Arquitectura (no busques más de lo que hay)

- La UI vive en `app/page.js`, un único componente cliente (`'use client'`). La lógica pura de importes (`money`, `parseAmount`) está en `lib/amount.js` para poder testearla sin React.
- No hay `components/`, ni API routes, ni base de datos.
- `app/layout.js` es el layout raíz. `app/globals.css` es la única hoja de estilos.
- Persistencia: `localStorage` bajo la clave **`gastos-v1`**. Sin backend ni sincronización.

## Trampas específicas

- `CATS` (arriba de `app/page.js`) es la **única fuente de verdad** de la cascada ámbito → categoría → subcategoría. Agregar o renombrar categorías se hace ahí; los `useEffect` de sincronización corrigen el form solos.
- Las claves de ámbito se comparan por igualdad exacta: `'Personal'` y `'Carpintería El Roble'` (con tilde). No las normalices ni traduzcas.
- El parseo de importes vive en `lib/amount.js` (`parseAmount`) y está cubierto por `lib/amount.test.js`. Regla **es-AR**: el último separador manda como decimal y un punto con exactamente 3 dígitos detrás se toma como miles. **No lo reemplaces por `parseFloat`** ni borres los tests: el bug histórico convertía `"1.5"` en `15`.
- UI, montos y fechas en **es-AR / ARS** (`Intl.NumberFormat('es-AR', {currency:'ARS'})`). Los textos visibles van en español.
- Los IDs de gasto se generan con `crypto.randomUUID()`.

## Git

- Rama de trabajo: `main`. Commits en estilo conventional (`feat:`, `fix:`).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
