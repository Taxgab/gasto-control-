import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { requireEnv } from './env';

/**
 * Cliente Supabase para Server Components, Server Actions y Route Handlers.
 *
 * Crea un cliente **por request**: nunca lo compartas entre requests.
 * Para verificar identidad usá `auth.getClaims()` (verifica la firma del JWT).
 * NO uses `getSession()` para autorizar: lee la cookie sin revalidarla.
 *
 * Si `setAll` falla (ocurre en Server Components, que no pueden escribir
 * cookies ni headers), el refresh de sesión queda a cargo de `proxy.ts`.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    requireEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv(
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    ),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Llamado desde un Server Component: no puede escribir cookies.
            // El refresh de sesión lo hace proxy.ts.
          }
        },
      },
    },
  );
}
