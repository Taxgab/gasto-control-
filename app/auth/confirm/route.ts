import { type EmailOtpType } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/**
 * Callback del magic link.
 *
 * El template de "Magic Link" debe apuntar acá:
 * `<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email">`
 *
 * Verifica el `token_hash`, crea la sesión (cookie vía @supabase/ssr) y
 * redirige al destino.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/';

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      redirect(next);
    }
  }

  redirect('/login?error=link_invalido');
}
