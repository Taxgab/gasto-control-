# AGENTS.md

App de registro de gastos personales y de Carpintería El Roble. Next.js App Router, JavaScript puro.

## Comandos

- `npm install` (usa `package-lock.json`; las deps están pineadas a versiones exactas)
- `npm run dev` → http://localhost:3000
- `npm run build` / `npm start`
- No hay tests, lint, typecheck ni CI. La única verificación real es levantar `npm run dev` y probar en el navegador.
- **Requiere Node ≥ 20.9** (Next 16 lo exige). El `node` del sistema es v18 y NO sirve: hay un Node 22 LTS en `~/.local/share/node/bin` que se agrega al PATH desde `~/.zshrc`. Si `npm` falla con `EBADENGINE`, es que estás usando el Node viejo.

## Arquitectura (no busques más de lo que hay)

- **Toda la app vive en `app/page.js`**, un único componente cliente (`'use client'`). No hay `components/`, ni API routes, ni base de datos.
- `app/layout.js` es el layout raíz. `app/globals.css` es la única hoja de estilos.
- Persistencia: `localStorage` bajo la clave **`gastos-v1`**. Sin backend ni sincronización.

## Trampas específicas

- `CATS` (arriba de `app/page.js`) es la **única fuente de verdad** de la cascada ámbito → categoría → subcategoría. Agregar o renombrar categorías se hace ahí; los `useEffect` de sincronización corrigen el form solos.
- Las claves de ámbito se comparan por igualdad exacta: `'Personal'` y `'Carpintería El Roble'` (con tilde). No las normalices ni traduzcas.
- El parseo del importe en `save()` está hecho para formato **es-AR**: quita lo que no sea dígito/coma/punto, elimina los puntos (separador de miles) y convierte la coma en decimal. **No lo reemplaces por `parseFloat`**: rompería los importes con punto de miles.
- UI, montos y fechas en **es-AR / ARS** (`Intl.NumberFormat('es-AR', {currency:'ARS'})`). Los textos visibles van en español.
- Los IDs de gasto se generan con `crypto.randomUUID()`.

## Git

- Rama de trabajo: `main`. Commits en estilo conventional (`feat:`, `fix:`).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
