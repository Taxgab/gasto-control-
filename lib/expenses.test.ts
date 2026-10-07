import { describe, it, expect } from 'vitest';
import {
  aggregateMonth,
  buildComparison,
  buildTrend,
  expenseInputSchema,
  type ExpenseAggRow,
} from './expenses';

const rows: ExpenseAggRow[] = [
  { expense_date: '2026-10-02', amount: 1000, scope: 'personal', category: 'Alimentación', subcategory: 'Supermercado', payment_method: 'credit' },
  { expense_date: '2026-10-03', amount: 500, scope: 'personal', category: 'Alimentación', subcategory: 'Delivery', payment_method: 'cash' },
  { expense_date: '2026-10-04', amount: 1500, scope: 'carpinteria', category: 'Materiales', subcategory: 'Madera', payment_method: 'transfer' },
];

describe('aggregateMonth', () => {
  const summary = aggregateMonth('2026-10', rows);

  it('suma el total y cuenta movimientos', () => {
    expect(summary.total).toBe(3000);
    expect(summary.count).toBe(3);
  });

  it('agrupa por ámbito con porcentajes', () => {
    expect(summary.byScope).toEqual([
      { scope: 'carpinteria', total: 1500, count: 1, pct: 50 },
      { scope: 'personal', total: 1500, count: 2, pct: 50 },
    ]);
  });

  it('agrupa por categoría', () => {
    expect(summary.byCategory[0]).toEqual({ category: 'Alimentación', total: 1500, count: 2, pct: 50 });
  });

  it('agrupa por medio de pago', () => {
    expect(summary.byPayment.map((p) => p.payment_method)).toEqual(['transfer', 'credit', 'cash']);
  });

  it('con lista vacía no divide por cero', () => {
    expect(aggregateMonth('2026-10', [])).toMatchObject({ total: 0, count: 0, byScope: [] });
  });
});

describe('buildTrend', () => {
  it('rellena con 0 los meses sin gastos', () => {
    const trend = buildTrend(['2026-08', '2026-09', '2026-10'], rows);
    expect(trend).toEqual([
      { month: '2026-08', total: 0 },
      { month: '2026-09', total: 0 },
      { month: '2026-10', total: 3000 },
    ]);
  });
});

describe('buildComparison', () => {
  const totals = { '2026-07': 1000, '2026-08': 2000, '2026-09': 1000, '2026-10': 1500 };

  it('compara contra el mes anterior y promedia los previos', () => {
    const c = buildComparison(totals, '2026-10');
    expect(c.current).toBe(1500);
    expect(c.previous).toBe(1000);
    expect(c.deltaPct).toBe(50);
    expect(c.avg3).toBe(1333.33);
  });

  it('deltaPct es null si el mes anterior fue 0', () => {
    expect(buildComparison({ '2026-10': 500 }, '2026-10').deltaPct).toBeNull();
  });
});

describe('expenseInputSchema', () => {
  const base = {
    expense_date: '2026-10-06',
    description: 'Supermercado',
    amount: 45000,
    scope: 'personal',
    category: 'Alimentación',
    subcategory: 'Supermercado',
    payment_method: 'credit',
  };

  it('acepta una entrada válida', () => {
    expect(expenseInputSchema.safeParse(base).success).toBe(true);
  });

  it('rechaza importe <= 0', () => {
    expect(expenseInputSchema.safeParse({ ...base, amount: 0 }).success).toBe(false);
  });

  it('rechaza descripción vacía', () => {
    expect(expenseInputSchema.safeParse({ ...base, description: '   ' }).success).toBe(false);
  });

  it('rechaza ámbito desconocido', () => {
    expect(expenseInputSchema.safeParse({ ...base, scope: 'nope' }).success).toBe(false);
  });

  it('rechaza fecha con formato inválido', () => {
    expect(expenseInputSchema.safeParse({ ...base, expense_date: '06/10/2026' }).success).toBe(false);
  });

  it('rechaza categoría que no pertenece al ámbito', () => {
    expect(expenseInputSchema.safeParse({ ...base, category: 'Materiales' }).success).toBe(false);
  });

  it('rechaza subcategoría que no pertenece a la categoría', () => {
    expect(expenseInputSchema.safeParse({ ...base, subcategory: 'Madera' }).success).toBe(false);
  });
});
