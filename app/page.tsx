import { redirect } from 'next/navigation';
import ExpensesSection from '@/components/expenses-section';
import { currentMonth } from '@/lib/dates';
import { listExpenses } from '@/lib/expenses';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect('/login');

  const email = typeof data.claims.email === 'string' ? data.claims.email : '';
  const month = currentMonth();
  const expenses = await listExpenses(supabase, { month });

  return (
    <main>
      <header>
        <div>
          <span className="eyebrow">CONTROL DE GASTOS</span>
          <h1>GastoControl</h1>
          <p>{email}</p>
        </div>
        <form action="/auth/signout" method="post">
          <button className="secondary" type="submit">
            Cerrar sesión
          </button>
        </form>
      </header>

      <ExpensesSection expenses={expenses} />
    </main>
  );
}
