import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LoginForm from './login-form';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims) redirect('/');

  const { error } = await searchParams;

  return (
    <main>
      <header>
        <div>
          <span className="eyebrow">CONTROL DE GASTOS</span>
          <h1>Entrá a GastoControl</h1>
          <p>Te mandamos un link a tu email. Sin contraseñas.</p>
        </div>
      </header>
      <section className="grid" style={{ gridTemplateColumns: 'minmax(0, 420px)' }}>
        <div className="card">
          {error ? <div className="empty">El link no es válido o expiró. Probá de nuevo.</div> : null}
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
