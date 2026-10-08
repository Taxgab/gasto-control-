import { redirect } from 'next/navigation';
import CategoryBreakdown from '@/components/category-breakdown';
import ComparisonCard from '@/components/comparison-card';
import ExpensesSection from '@/components/expenses-section';
import Insights from '@/components/insights';
import MonthlyChart from '@/components/monthly-chart';
import ScopeSummary from '@/components/scope-summary';
import { scopeLabel, SCOPES } from '@/lib/categories';
import { currentMonth, lastMonths } from '@/lib/dates';
import { getComparison, getMonthSummary, getMonthlyTrend, listExpenses } from '@/lib/expenses';
import { buildInsights } from '@/lib/insights';
import { money } from '@/lib/format';
import { createClient } from '@/lib/supabase/server';
import type { Scope } from '@/lib/types';

const MONTH_RE = /^\d{4}-\d{2}$/;

interface HomeProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function single(value: string | string[] | undefined): string {
  return typeof value === 'string' ? value : '';
}

export default async function Home({ searchParams }: HomeProps) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect('/login');

  const email = typeof data.claims.email === 'string' ? data.claims.email : '';
  const params = await searchParams;

  const monthParam = single(params.month);
  const month = MONTH_RE.test(monthParam) ? monthParam : currentMonth();

  const scopeParam = single(params.scope);
  const scope = SCOPES.some((option) => option.value === scopeParam)
    ? (scopeParam as Scope)
    : undefined;

  const categoryParam = single(params.category).trim();
  const category = categoryParam || undefined;

  const queryParam = single(params.q).trim();
  const query = queryParam || undefined;

  const months = lastMonths(month, 6);

  const [expenses, summary, trend, comparison] = await Promise.all([
    listExpenses(supabase, { month, scope, category, search: query }),
    getMonthSummary(supabase, month),
    getMonthlyTrend(supabase, months),
    getComparison(supabase, month),
  ]);

  const insights = buildInsights(summary, comparison);

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

      <section className="stats">
        <div>
          <span>Gasto del mes</span>
          <strong>{money(summary.total)}</strong>
          <small>
            {summary.count} {summary.count === 1 ? 'movimiento' : 'movimientos'}
          </small>
        </div>
        {summary.byScope.map((row) => (
          <div key={row.scope}>
            <span>{scopeLabel(row.scope)}</span>
            <b>{money(row.total)}</b>
            <small>{row.pct.toFixed(0)}%</small>
          </div>
        ))}
      </section>

      <div className="grid2">
        <ScopeSummary rows={summary.byScope} />
        <ComparisonCard comparison={comparison} />
      </div>

      <div style={{ marginTop: 20 }}>
        <MonthlyChart trend={trend} />
      </div>

      <div className="grid2" style={{ marginTop: 20 }}>
        <CategoryBreakdown rows={summary.byCategory} />
        <Insights insights={insights} />
      </div>

      <div style={{ marginTop: 20 }}>
        <ExpensesSection
          expenses={expenses}
          month={month}
          scope={scope}
          category={category}
          query={query}
        />
      </div>
    </main>
  );
}
