# GastoControl

App para registrar, organizar y analizar gastos mensuales (personales y de Carpintería El Roble), mobile-first e instalable como PWA.

**Producción:** https://gasto-control-theta.vercel.app

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 16 (App Router) · React 19 · TypeScript 7 · CSS propio (sin librería de UI) |
| Gráfico de evolución | SVG/CSS propio (sin librería de charts) |
| Backend / datos | Supabase (Postgres + Auth + Row Level Security) |
| Email de Auth | Resend (SMTP propio) |
| Deploy | Vercel (deploy automático desde `main`) |
| Tests | Vitest |

## Estructura

```
app/
  layout.tsx              layout raíz + metadata PWA (themeColor, appleWebApp)
  page.tsx                dashboard (Server Component, gate de sesión)
  globals.css             única hoja de estilos (mobile-first, media queries 800/500px)
  manifest.ts             manifest de la PWA
  icon.png / apple-icon.png  favicon e ícono de iOS
  login/                  pantalla y formulario de login (magic link)
  auth/confirm/route.ts   callback del magic link (verifyOtp)
  auth/signout/route.ts   logout
  actions/expenses.ts     Server Actions (crear/editar/borrar gasto)
components/               UI en cliente (form, lista, filtros, dashboard)
lib/                      dominio tipado, sin React
  types.ts  categories.ts  format.ts  dates.ts  expenses.ts  insights.ts
  supabase/{client,server,proxy,env}.ts
proxy.ts                  refresco de sesión (Next 16 renombró middleware -> proxy)
public/icons/             íconos 192 y 512 (Android)
```

## Requisitos

- **Node ≥ 20.9** (Next 16 lo exige).
- Cuenta de Supabase y de Vercel para desplegar.

## Instalación local

```bash
npm install
cp .env.example .env.local   # completar los valores
npm run dev                  # http://localhost:3000
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key (pública por diseño) |

Nunca uses `service_role` en este proyecto: la seguridad está en RLS.

## Supabase

- **Proyecto:** GastoControl · ref `tcklfsdorlzfvxydgvgl` · región `sa-east-1`.
- **Tabla:** `public.expenses` (`expense_date`, `description`, `amount`, `scope`, `category`, `subcategory`, `payment_method`, `origin`, `notes`, `user_id`, timestamps). El **mes se deriva** de `expense_date`, no se almacena.
- **RLS activado** con políticas `auth.uid() = user_id` para SELECT/INSERT/UPDATE/DELETE. Ningún usuario puede ver ni modificar datos de otro.
- **Ámbitos:** `personal`, `carpinteria`, `father`, `other`.
- **Auth:** magic link (email), ver más abajo.

### Configuración necesaria en el dashboard de Supabase

- **URL Configuration → Site URL:** el dominio de producción, y en **Redirect URLs** agregar `https://<tu-dominio>/**` y `http://localhost:3000/**`.
- **Email Templates → Magic Link:** el link **debe** apuntar a `/auth/confirm`:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Entrar</a>
```

- **SMTP propio (Resend):** el SMTP por defecto de Supabase sólo entrega a miembros del team y con un límite de 2 emails/hora, así que no sirve para producción. Configurar en Authentication → SMTP Settings (`smtp.resend.com`, puerto 465, usuario `resend`, password = API key).

## Autenticación (magic link)

1. El usuario ingresa su email en `/login`.
2. El cliente llama `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: <origin>/auth/confirm } })`.
3. Supabase envía el mail (vía Resend). El link trae `token_hash` y `type=email`.
4. `/auth/confirm` verifica con `verifyOtp({ type, token_hash })` y crea la sesión en **cookies** (`@supabase/ssr`).
5. `proxy.ts` refresca la sesión en cada request; el dashboard valida con `auth.getClaims()` y, sin sesión, redirige a `/login`.

La sesión vive en cookies (nunca en `localStorage`).

## Deploy (Vercel)

1. Importar `Taxgab/gasto-control-` desde GitHub (framework Next.js, sin configuración extra).
2. Cargar las dos variables de entorno en **Production, Preview y Development**.
3. Deploy. A partir de ahí, cada push a `main` despliega solo.

> Si agregás variables **después** de un deploy, hay que **redeployar**: los deploys existentes no las toman.

## Scripts

```bash
npm run dev        # desarrollo
npm run build      # build de producción
npm start          # servir el build
npm test           # Vitest (lógica de dominio)
npm run typecheck  # tsc --noEmit
```

## Futuras funcionalidades (V2)

- Importación de resúmenes de tarjetas, tickets y comprobantes con **IA** (campos `origin = card_statement/receipt/import`, y un futuro `needs_review`).
- Detección conservadora de **duplicados**.
- Soporte de **cuotas**.
- Importar datos del prototipo viejo (`localStorage`).
- **Service worker** / modo offline (hoy la app es instalable sin SW).
