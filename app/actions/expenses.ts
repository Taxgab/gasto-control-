'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createExpense, deleteExpense, updateExpense } from '@/lib/expenses';
import { parseAmount } from '@/lib/format';
import { createClient } from '@/lib/supabase/server';

export interface ActionState {
  ok?: boolean;
  error?: string;
}

function messageFromError(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues.map((issue) => issue.message).join('. ');
  }
  if (error instanceof Error) return error.message;
  return 'No se pudo guardar el gasto.';
}

function readExpenseForm(formData: FormData) {
  return {
    id: formData.get('id')?.toString() || undefined,
    expense_date: formData.get('expense_date')?.toString() ?? '',
    description: formData.get('description')?.toString() ?? '',
    // El importe llega como texto es-AR; se parsea acá, nunca en el cliente.
    amount: parseAmount(formData.get('amount')?.toString() ?? ''),
    scope: formData.get('scope')?.toString() ?? '',
    category: formData.get('category')?.toString() ?? '',
    subcategory: formData.get('subcategory')?.toString() || null,
    payment_method: formData.get('payment_method')?.toString() || null,
    notes: formData.get('notes')?.toString() || null,
  };
}

/** Crea o actualiza un gasto (según venga `id`). La validación es server-side. */
export async function saveExpense(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return { error: 'Tu sesión expiró. Volvé a entrar.' };

  const { id, ...input } = readExpenseForm(formData);

  try {
    if (id) {
      await updateExpense(supabase, id, input);
    } else {
      await createExpense(supabase, input);
    }
  } catch (error) {
    return { error: messageFromError(error) };
  }

  revalidatePath('/');
  return { ok: true };
}

/** Elimina un gasto. */
export async function removeExpense(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect('/login');

  const id = formData.get('id')?.toString();
  if (id) {
    await deleteExpense(supabase, id);
    revalidatePath('/');
  }
}
