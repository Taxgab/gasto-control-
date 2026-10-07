'use client';

import { useCallback, useState } from 'react';
import type { Expense } from '@/lib/types';
import ExpenseForm from './expense-form';
import ExpenseList from './expense-list';

interface ExpensesSectionProps {
  expenses: Expense[];
}

/**
 * Orquesta el formulario y la lista. Mantiene el estado de edición (que es
 * puramente de UI, por eso vive en el cliente) y remonta el formulario tras
 * guardar para limpiarlo.
 */
export default function ExpensesSection({ expenses }: ExpensesSectionProps) {
  const [editing, setEditing] = useState<Expense | null>(null);
  const [formKey, setFormKey] = useState(0);

  const reset = useCallback(() => {
    setEditing(null);
    setFormKey((key) => key + 1);
  }, []);

  return (
    <section className="grid">
      <ExpenseForm key={formKey} expense={editing} onSaved={reset} onCancel={reset} />
      <ExpenseList expenses={expenses} onEdit={setEditing} />
    </section>
  );
}
