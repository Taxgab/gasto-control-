'use client';

import { useActionState, useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
import { saveExpense, type ActionState } from '@/app/actions/expenses';
import { categoryNames, PAYMENT_METHODS, SCOPES, subcategoryNames } from '@/lib/categories';
import { money, parseAmount } from '@/lib/format';
import type { Expense, PaymentMethod, Scope } from '@/lib/types';

const initialState: ActionState = {};

function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

interface ExpenseFormProps {
  expense: Expense | null;
  onSaved: () => void;
  onCancel: () => void;
}

export default function ExpenseForm({ expense, onSaved, onCancel }: ExpenseFormProps) {
  const [state, formAction, pending] = useActionState(saveExpense, initialState);

  const [amount, setAmount] = useState(expense ? String(expense.amount) : '');
  const [date, setDate] = useState(expense?.expense_date ?? '');
  const [scope, setScope] = useState<Scope>(expense?.scope ?? 'personal');
  const [category, setCategory] = useState(expense?.category ?? categoryNames('personal')[0]);
  const [subcategory, setSubcategory] = useState(expense?.subcategory ?? '');

  // La fecha por defecto se calcula en el cliente para respetar el día local
  // (el server corre en UTC y cerca de la medianoche daría otro día).
  useEffect(() => {
    if (!expense && !date) setDate(todayLocal());
  }, [expense, date]);

  useEffect(() => {
    if (state.ok) onSaved();
  }, [state, onSaved]);

  function changeScope(next: Scope) {
    setScope(next);
    setCategory(categoryNames(next)[0] ?? '');
    setSubcategory('');
  }

  function changeCategory(next: string) {
    setCategory(next);
    setSubcategory('');
  }

  const preview = parseAmount(amount);

  return (
    <form className="card form" action={formAction}>
      {expense ? <input type="hidden" name="id" value={expense.id} /> : null}

      <div className="cardtitle">
        <div>
          <span className="eyebrow">{expense ? 'EDITAR' : 'NUEVO MOVIMIENTO'}</span>
          <h2>{expense ? 'Editar gasto' : 'Agregar gasto'}</h2>
        </div>
        <Wallet size={22} />
      </div>

      <label>
        Importe
        <input
          id="amount"
          name="amount"
          inputMode="decimal"
          placeholder="$ 0"
          autoComplete="off"
          required
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </label>
      {Number.isFinite(preview) && preview > 0 ? (
        <small style={{ color: 'var(--muted)' }}>Se guardará {money(preview)}</small>
      ) : null}

      <label>
        Descripción
        <input
          id="description"
          name="description"
          placeholder="Ej. supermercado"
          autoComplete="off"
          required
          defaultValue={expense?.description ?? ''}
        />
      </label>

      <div className="two">
        <label>
          Fecha
          <input
            id="expense_date"
            type="date"
            name="expense_date"
            required
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </label>
        <label>
          Ámbito
          <select
            id="scope"
            name="scope"
            value={scope}
            onChange={(event) => changeScope(event.target.value as Scope)}
          >
            {SCOPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="two">
        <label>
          Categoría
          <select
            id="category"
            name="category"
            value={category}
            onChange={(event) => changeCategory(event.target.value)}
          >
            {categoryNames(scope).map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
        <label>
          Subcategoría
          <select
            id="subcategory"
            name="subcategory"
            value={subcategory}
            onChange={(event) => setSubcategory(event.target.value)}
          >
            <option value="">—</option>
            {subcategoryNames(scope, category).map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
      </div>

      <label>
        Medio de pago
        <select
          id="payment_method"
          name="payment_method"
          defaultValue={(expense?.payment_method as PaymentMethod | null) ?? 'cash'}
        >
          {PAYMENT_METHODS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Notas (opcional)
        <textarea id="notes" name="notes" rows={2} defaultValue={expense?.notes ?? ''} />
      </label>

      {state.error ? <div className="empty">{state.error}</div> : null}

      <button className="primary" type="submit" disabled={pending}>
        {pending ? 'Guardando…' : expense ? 'Guardar cambios' : 'Registrar gasto'}
      </button>
      {expense ? (
        <button type="button" className="secondary" onClick={onCancel}>
          Cancelar
        </button>
      ) : null}
    </form>
  );
}
