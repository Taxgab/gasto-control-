import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { requireEnv } from './env';

/**
 * Refresca la sesión de Supabase en cada request y propaga las cookies
 * actualizadas a la respuesta.
 *
 * Notas críticas (doc vigente de Supabase para SSR):
 * - Usar `getClaims()`, NO `getUser()` ni `getSession()`. `getClaims` verifica
 *   la firma del JWT y refresca la sesión si el token está por expirar.
 * - No agregues lógica entre `createServerClient` y `getClaims()`.
 * - Hay que aplicar los `headers` de cache que entrega `setAll`, o un CDN
 *   podría cachear la respuesta con `Set-Cookie` y filtrar la sesión.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    requireEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv(
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    ),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          );
        },
      },
    },
  );

  await supabase.auth.getClaims();

  return supabaseResponse;
}
