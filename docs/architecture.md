# Arquitectura — GastoControl

## Vista general

```
iPhone / Android (PWA instalada)
        │  cookies de sesión (no localStorage)
        ▼
Next.js 16 App Router (Vercel)
   ├─ proxy.ts ............ refresca la sesión en cada request
   ├─ Server Components ... dashboard, lecturas (RLS aplica con la sesión del usuario)
   ├─ Server Actions ...... crear / editar / borrar gasto
   └─ lib/supabase/* ...... clientes browser / server
        │
        ▼
Supabase (Postgres + Auth + RLS)
   public.expenses  ── RLS: auth.uid() = user_id
   Auth: magic link (email vía Resend)
```

## Ciclo de un request autenticado

1. `proxy.ts` (raíz) llama `updateSession()`: crea un cliente Supabase con `createServerClient`, ejecuta `auth.getClaims()` para refrescar el token y propaga las cookies + headers de cache a la respuesta.
2. El Server Component (`app/page.tsx`) crea su propio cliente (`lib/supabase/server.ts`, un cliente **por request**), verifica `auth.getClaims()` y, si no hay sesión, redirige a `/login`.
3. Las lecturas pasan por `lib/expenses.ts` (nunca queries sueltas en componentes) usando el cliente con la sesión del usuario. RLS filtra por `user_id`.
4. Las escrituras pasan por Server Actions (`app/actions/expenses.ts`) que validan con `zod`, llaman a `lib/expenses.ts` y hacen `revalidatePath('/')`.

## Decisiones

| Decisión | Elección | Motivo |
|---|---|---|
| Tipo de dato | TypeScript estricto | Supabase tipado, RLS, App Router. |
| Escrituras | Server Actions | Validación y sesión en el servidor; sin endpoints expuestos. |
| Lecturas | Server Components | RLS aplica sola con la cookie del usuario. |
| Verificar identidad | `auth.getClaims()` | Verifica la firma del JWT. **Nunca** `getSession()`. |
| Sesión | Cookies vía `@supabase/ssr` | Segura para SSR; nunca `localStorage`. |
| Agregaciones | JS sobre ≤12 meses | Sin migraciones de DB; sólo columnas necesarias. |
| Gráfico | SVG/CSS propio | 6 puntos no justifican una librería. |
| PWA | manifest + iconos | No requiere service worker para instalar. |
| Categorías | `lib/categories.ts` | Fuente única; nada hardcodeado en componentes. |

## Seguridad

- **RLS es la fuente de verdad.** Toda la seguridad vive en Postgres; el frontend no decide permisos.
- **Nunca `service_role`** en este proyecto.
- Validación `zod` server-side: importe > 0, descripción obligatoria, fecha con formato válido, y coherencia categoría↔ámbito y subcategoría↔categoría.
- **Verificado:** un usuario no puede leer, editar ni borrar los gastos de otro; anónimos no leen (`[]`) ni escriben (`401`).

## Capa de dominio (`lib/`)

| Archivo | Responsabilidad |
|---|---|
| `types.ts` | `Scope`, `PaymentMethod`, `ExpenseOrigin`, `Expense`, `ExpenseInput`. |
| `categories.ts` | Ámbitos, árbol de categorías, medios de pago, orígenes y etiquetas. |
| `format.ts` | `money()` y `parseAmount()` (es-AR). |
| `dates.ts` | Helpers de mes derivados de `expense_date` (UTC). |
| `expenses.ts` | CRUD + agregaciones (`getMonthSummary`, `getMonthlyTrend`, `getComparison`) + `expenseInputSchema` (zod). Las agregaciones puras (`aggregateMonth`, `buildTrend`, `buildComparison`) están separadas de Supabase para poder testearlas. |
| `insights.ts` | Reglas de insights (puras, máx. 4). |

## Tests

Vitest sobre la lógica de dominio (`*.test.ts`): parseo de importes, helpers de fecha, agregaciones y validación. La UI se verifica manualmente (no hay runner E2E automatizado).
