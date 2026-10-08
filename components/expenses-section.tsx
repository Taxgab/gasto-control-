'use client';

import { useCallback, useState } from 'react';
import type { Expense, Scope } from '@/lib/types';
import ExpenseForm from './expense-form';
import ExpenseList from './expense-list';
import FiltersBar from './filters-bar';

interface ExpensesSectionProps {
  expenses: Expense[];
  month: string;
  scope?: Scope;
  category?: string;
  query?: string;
}

/**
 * Orquesta el formulario y el historial. El estado de edición es de UI (cliente);
 * los filtros viven en la URL y los resuelve el server.
 */
export default function ExpensesSection({
  expenses,
  month,
  scope,
  category,
  query,
}: ExpensesSectionProps) {
  const [editing, setEditing] = useState<Expense | null>(null);
  const [formKey, setFormKey] = useState(0);

  const reset = useCallback(() => {
    setEditing(null);
    setFormKey((key) => key + 1);
  }, []);

  const filtered = Boolean(scope || category || query);

  return (
    <section className="grid">
      <ExpenseForm key={formKey} expense={editing} onSaved={reset} onCancel={reset} />

      <div className="card history">
        <div className="cardtitle">
          <div>
            <span className="eyebrow">HISTORIAL</span>
            <h2>Movimientos</h2>
          </div>
          <span className="count">{expenses.length}</span>
        </div>

        <FiltersBar month={month} scope={scope} category={category} query={query} />
        <ExpenseList expenses={expenses} onEdit={setEditing} filtered={filtered} />
      </div>
    </section>
  );
}
