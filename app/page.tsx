import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) redirect('/login');

  const email = typeof data.claims.email === 'string' ? data.claims.email : '';

  return (
    <main>
      <header>
        <div>
          <span className="eyebrow">CONTROL DE GASTOS</span>
          <h1>GastoControl</h1>
          <p>Sesión iniciada como {email}.</p>
        </div>
        <form action="/auth/signout" method="post">
          <button className="secondary" type="submit">
            Cerrar sesión
          </button>
        </form>
      </header>

      <section className="card">
        <div className="cardtitle">
          <div>
            <span className="eyebrow">PRÓXIMO PASO</span>
            <h2>Dashboard en construcción</h2>
          </div>
        </div>
        <p>
          La autenticación ya funciona. El dashboard con totales, categorías y evolución
          llega en la próxima fase.
        </p>
      </section>
    </main>
  );
}
