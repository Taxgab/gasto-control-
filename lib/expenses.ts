import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { CATEGORIES } from './categories';
import { addMonths, monthOf, monthRange } from './dates';
import type { Expense, PaymentMethod, Scope } from './types';

const SCOPES = ['personal', 'carpinteria', 'father', 'other'] as const;
const PAYMENT_METHODS = ['cash', 'debit', 'credit', 'transfer', 'other'] as const;
const ORIGINS = ['manual', 'card_statement', 'receipt', 'import'] as const;

/**
 * Validación de entrada de un gasto. Se ejecuta SIEMPRE en el servidor
 * (Server Actions), nunca sólo en el cliente.
 */
export const expenseInputSchema = z
  .object({
    expense_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
    description: z.string().trim().min(1, 'La descripción es obligatoria').max(200),
    amount: z.number().finite().positive('El importe debe ser mayor a 0'),
    scope: z.enum(SCOPES),
    category: z.string().trim().min(1, 'La categoría es obligatoria'),
    subcategory: z.string().trim().min(1).nullish(),
    payment_method: z.enum(PAYMENT_METHODS).nullish(),
    origin: z.enum(ORIGINS).optional(),
    notes: z.string().trim().max(1000).nullish(),
  })
  .superRefine((value, ctx) => {
    const tree = CATEGORIES[value.scope];
    if (!tree[value.category]) {
      ctx.addIssue({
        code: 'custom',
        path: ['category'],
        message: `Categoría inválida para el ámbito "${value.scope}"`,
      });
      return;
    }
    if (value.subcategory && !tree[value.category].includes(value.subcategory)) {
      ctx.addIssue({
        code: 'custom',
        path: ['subcategory'],
        message: 'Subcategoría inválida para la categoría elegida',
      });
    }
  });

export type ValidExpenseInput = z.infer<typeof expenseInputSchema>;

export interface ExpenseFilters {
  month?: string; // 'YYYY-MM'
  scope?: Scope;
  category?: string;
  search?: string;
  from?: string; // 'YYYY-MM-DD'
  to?: string; // 'YYYY-MM-DD'
}

/** Columnas mínimas para agregaciones. */
export type ExpenseAggRow = Pick<
  Expense,
  'amount' | 'scope' | 'category' | 'subcategory' | 'payment_method'
> & { expense_date: string };

export interface ScopeSummaryRow {
  scope: Scope;
  total: number;
  count: number;
  pct: number;
}
export interface CategorySummaryRow {
  category: string;
  total: number;
  count: number;
  pct: number;
}
export interface PaymentSummaryRow {
  payment_method: PaymentMethod | null;
  total: number;
  count: number;
}
export interface MonthSummary {
  month: string;
  total: number;
  count: number;
  byScope: ScopeSummaryRow[];
  byCategory: CategorySummaryRow[];
  byPayment: PaymentSummaryRow[];
}
export interface TrendPoint {
  month: string;
  total: number;
}
export interface Comparison {
  month: string;
  current: number;
  previous: number;
  avg3: number;
  avg6: number;
  /** Variación % contra el mes anterior. null si el mes anterior fue 0. */
  deltaPct: number | null;
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const pct = (part: number, total: number) => (total > 0 ? round2((part / total) * 100) : 0);

/* -------------------------------------------------------------------------- */
/* Agregaciones puras (testeables sin Supabase)                                */
/* -------------------------------------------------------------------------- */

export function aggregateMonth(month: string, rows: ExpenseAggRow[]): MonthSummary {
  const total = rows.reduce((sum, r) => sum + Number(r.amount), 0);

  const scopes = new Map<Scope, { total: number; count: number }>();
  const categories = new Map<string, { total: number; count: number }>();
  const payments = new Map<PaymentMethod | null, { total: number; count: number }>();

  for (const row of rows) {
    const amount = Number(row.amount);
    const s = scopes.get(row.scope) ?? { total: 0, count: 0 };
    scopes.set(row.scope, { total: s.total + amount, count: s.count + 1 });

    const c = categories.get(row.category) ?? { total: 0, count: 0 };
    categories.set(row.category, { total: c.total + amount, count: c.count + 1 });

    const p = payments.get(row.payment_method) ?? { total: 0, count: 0 };
    payments.set(row.payment_method, { total: p.total + amount, count: p.count + 1 });
  }

  const byScope = [...scopes.entries()]
    .map(([scope, v]) => ({ scope, total: round2(v.total), count: v.count, pct: pct(v.total, total) }))
    .sort((a, b) => b.total - a.total || a.scope.localeCompare(b.scope));

  const byCategory = [...categories.entries()]
    .map(([category, v]) => ({
      category,
      total: round2(v.total),
      count: v.count,
      pct: pct(v.total, total),
    }))
    .sort((a, b) => b.total - a.total || a.category.localeCompare(b.category, 'es'));

  const byPayment = [...payments.entries()]
    .map(([payment_method, v]) => ({ payment_method, total: round2(v.total), count: v.count }))
    .sort(
      (a, b) =>
        b.total - a.total ||
        String(a.payment_method).localeCompare(String(b.payment_method)),
    );

  return { month, total: round2(total), count: rows.length, byScope, byCategory, byPayment };
}

export function buildTrend(
  months: string[],
  rows: Pick<Expense, 'expense_date' | 'amount'>[],
): TrendPoint[] {
  const totals = new Map<string, number>();
  for (const row of rows) {
    const key = monthOf(row.expense_date);
    totals.set(key, (totals.get(key) ?? 0) + Number(row.amount));
  }
  return months.map((month) => ({ month, total: round2(totals.get(month) ?? 0) }));
}

export function buildComparison(totals: Record<string, number>, month: string): Comparison {
  const current = totals[month] ?? 0;
  const previous = totals[addMonths(month, -1)] ?? 0;
  const average = (n: number) => {
    let sum = 0;
    for (let i = 1; i <= n; i += 1) sum += totals[addMonths(month, -i)] ?? 0;
    return round2(sum / n);
  };
  return {
    month,
    current: round2(current),
    previous: round2(previous),
    avg3: average(3),
    avg6: average(6),
    deltaPct: previous > 0 ? round2(((current - previous) / previous) * 100) : null,
  };
}

/* -------------------------------------------------------------------------- */
/* Acceso a datos (Supabase). Nada de queries en los componentes.              */
/* -------------------------------------------------------------------------- */

const escapeForOr = (term: string) => term.replace(/[,()*%]/g, ' ').trim();

async function fetchMonthRows(
  supabase: SupabaseClient,
  month: string,
): Promise<ExpenseAggRow[]> {
  const { start, end } = monthRange(month);
  const { data, error } = await supabase
    .from('expenses')
    .select('expense_date, amount, scope, category, subcategory, payment_method')
    .gte('expense_date', start)
    .lte('expense_date', end);
  if (error) throw new Error(error.message);
  return (data ?? []) as ExpenseAggRow[];
}

export async function listExpenses(
  supabase: SupabaseClient,
  filters: ExpenseFilters = {},
): Promise<Expense[]> {
  let query = supabase
    .from('expenses')
    .select('*')
    .order('expense_date', { ascending: false });

  if (filters.month) {
    const { start, end } = monthRange(filters.month);
    query = query.gte('expense_date', start).lte('expense_date', end);
  }
  if (filters.from) query = query.gte('expense_date', filters.from);
  if (filters.to) query = query.lte('expense_date', filters.to);
  if (filters.scope) query = query.eq('scope', filters.scope);
  if (filters.category) query = query.eq('category', filters.category);

  const term = filters.search ? escapeForOr(filters.search) : '';
  if (term) {
    query = query.or(
      `description.ilike.%${term}%,category.ilike.%${term}%,subcategory.ilike.%${term}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Expense[];
}

export async function getExpense(supabase: SupabaseClient, id: string): Promise<Expense | null> {
  const { data, error } = await supabase.from('expenses').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Expense | null) ?? null;
}

export async function createExpense(supabase: SupabaseClient, input: unknown): Promise<Expense> {
  const parsed = expenseInputSchema.parse(input);
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      expense_date: parsed.expense_date,
      description: parsed.description,
      amount: parsed.amount,
      scope: parsed.scope,
      category: parsed.category,
      subcategory: parsed.subcategory ?? null,
      payment_method: parsed.payment_method ?? null,
      origin: parsed.origin ?? 'manual',
      notes: parsed.notes ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Expense;
}

export async function updateExpense(
  supabase: SupabaseClient,
  id: string,
  input: unknown,
): Promise<Expense> {
  const parsed = expenseInputSchema.parse(input);
  const { data, error } = await supabase
    .from('expenses')
    .update({
      expense_date: parsed.expense_date,
      description: parsed.description,
      amount: parsed.amount,
      scope: parsed.scope,
      category: parsed.category,
      subcategory: parsed.subcategory ?? null,
      payment_method: parsed.payment_method ?? null,
      notes: parsed.notes ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('No se encontró el gasto (¿es tuyo?).');
  return data as Expense;
}

export async function deleteExpense(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function getMonthSummary(
  supabase: SupabaseClient,
  month: string,
): Promise<MonthSummary> {
  return aggregateMonth(month, await fetchMonthRows(supabase, month));
}

/** Atajo: el resumen por ámbito ya viene en `getMonthSummary().byScope`. */
export async function getScopeSummary(supabase: SupabaseClient, month: string) {
  return (await getMonthSummary(supabase, month)).byScope;
}

/** Atajo: el resumen por categoría ya viene en `getMonthSummary().byCategory`. */
export async function getCategorySummary(supabase: SupabaseClient, month: string) {
  return (await getMonthSummary(supabase, month)).byCategory;
}

export async function getMonthlyTrend(
  supabase: SupabaseClient,
  months: string[],
): Promise<TrendPoint[]> {
  if (months.length === 0) return [];
  const start = monthRange(months[0]).start;
  const end = monthRange(months[months.length - 1]).end;
  const { data, error } = await supabase
    .from('expenses')
    .select('expense_date, amount')
    .gte('expense_date', start)
    .lte('expense_date', end);
  if (error) throw new Error(error.message);
  return buildTrend(months, (data ?? []) as Pick<Expense, 'expense_date' | 'amount'>[]);
}

export async function getComparison(
  supabase: SupabaseClient,
  month: string,
): Promise<Comparison> {
  const months = Array.from({ length: 7 }, (_, i) => addMonths(month, -(6 - i)));
  const trend = await getMonthlyTrend(supabase, months);
  const totals: Record<string, number> = {};
  for (const point of trend) totals[point.month] = point.total;
  return buildComparison(totals, month);
}
