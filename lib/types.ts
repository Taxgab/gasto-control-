/**
 * Tipos de dominio de GastoControl.
 *
 * Los valores internos (scope, payment_method, origin) son estables y en
 * minúscula, porque son los que acepta la base de datos. Las etiquetas en
 * español viven en `lib/categories.ts`.
 */

export type Scope = 'personal' | 'carpinteria' | 'father' | 'other';

export type PaymentMethod = 'cash' | 'debit' | 'credit' | 'transfer' | 'other';

export type ExpenseOrigin = 'manual' | 'card_statement' | 'receipt' | 'import';

/** Fila de `public.expenses` tal como la devuelve Supabase. */
export interface Expense {
  id: string;
  expense_date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  scope: Scope;
  category: string;
  subcategory: string | null;
  payment_method: PaymentMethod | null;
  origin: ExpenseOrigin;
  notes: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

/** Datos que envía el usuario al crear o editar un gasto (sin campos generados). */
export interface ExpenseInput {
  expense_date: string;
  description: string;
  amount: number;
  scope: Scope;
  category: string;
  subcategory?: string | null;
  payment_method?: PaymentMethod | null;
  origin?: ExpenseOrigin;
  notes?: string | null;
}
