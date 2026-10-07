import { describe, it, expect } from 'vitest';
import { buildInsights } from './insights';
import { aggregateMonth, type ExpenseAggRow } from './expenses';

const rows: ExpenseAggRow[] = [
  { expense_date: '2026-10-02', amount: 8000, scope: 'personal', category: 'Alimentación', subcategory: 'Supermercado', payment_method: 'credit' },
  { expense_date: '2026-10-03', amount: 2000, scope: 'carpinteria', category: 'Materiales', subcategory: 'Madera', payment_method: 'cash' },
];

const summary = aggregateMonth('2026-10', rows);

describe('buildInsights', () => {
  it('avisa cuando no hay gastos', () => {
    const empty = aggregateMonth('2026-10', []);
    const insights = buildInsights(empty, {
      month: '2026-10', current: 0, previous: 0, avg3: 0, avg6: 0, deltaPct: null,
    });
    expect(insights).toHaveLength(1);
    expect(insights[0].text).toContain('no registraste gastos');
  });

  it('detecta subida fuerte contra el mes anterior', () => {
    const insights = buildInsights(summary, {
      month: '2026-10', current: 10000, previous: 5000, avg3: 5000, avg6: 5000, deltaPct: 100,
    });
    expect(insights.some((i) => i.text.includes('subió 100%') && i.tone === 'up')).toBe(true);
  });

  it('detecta bajada contra el mes anterior', () => {
    const insights = buildInsights(summary, {
      month: '2026-10', current: 4000, previous: 8000, avg3: 8000, avg6: 8000, deltaPct: -50,
    });
    expect(insights.some((i) => i.text.includes('bajó 50%') && i.tone === 'down')).toBe(true);
  });

  it('menciona el ámbito dominante cuando supera el 40%', () => {
    const insights = buildInsights(summary, {
      month: '2026-10', current: 10000, previous: 10000, avg3: 10000, avg6: 10000, deltaPct: 0,
    });
    expect(insights.some((i) => i.text.includes('Personal'))).toBe(true);
  });

  it('no inventa insights sin señales (variación < 10%)', () => {
    const insights = buildInsights(summary, {
      month: '2026-10', current: 10000, previous: 9800, avg3: 10000, avg6: 10000, deltaPct: 2,
    });
    expect(insights.some((i) => i.text.includes('mes anterior'))).toBe(false);
  });
});
