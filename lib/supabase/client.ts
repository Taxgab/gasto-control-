import { createBrowserClient } from '@supabase/ssr';
import { requireEnv } from './env';

/** Cliente Supabase para componentes del navegador. La sesión vive en cookies. */
export function createClient() {
  return createBrowserClient(
    requireEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv(
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    ),
  );
}
