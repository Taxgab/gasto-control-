'use client';

import { Briefcase, Pencil, Trash2, User, Users, Wallet } from 'lucide-react';
import { removeExpense } from '@/app/actions/expenses';
import { paymentLabel } from '@/lib/categories';
import { money } from '@/lib/format';
import type { Expense, Scope } from '@/lib/types';

const SCOPE_ICONS: Record<Scope, typeof User> = {
  personal: User,
  carpinteria: Briefcase,
  father: Users,
  other: Wallet,
};

function formatDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString('es-AR');
}

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
}

export default function ExpenseList({ expenses, onEdit }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="card history">
        <div className="empty">Todavía no hay gastos este mes.</div>
      </div>
    );
  }

  return (
    <div className="card history">
      <div className="cardtitle">
        <div>
          <span className="eyebrow">MOVIMIENTOS</span>
          <h2>Este mes</h2>
        </div>
        <span className="count">{expenses.length}</span>
      </div>

      <div className="list">
        {expenses.map((expense) => {
          const Icon = SCOPE_ICONS[expense.scope] ?? Wallet;
          return (
            <article key={expense.id}>
              <div className="icon">
                <Icon size={17} />
              </div>
              <div className="desc">
                <b>{expense.description}</b>
                <small>
                  {formatDate(expense.expense_date)} · {expense.category}
                  {expense.subcategory ? ` / ${expense.subcategory}` : ''}
                  {expense.payment_method ? ` · ${paymentLabel(expense.payment_method)}` : ''}
                </small>
              </div>
              <strong>{money(Number(expense.amount))}</strong>

              <button
                type="button"
                className="iconbtn"
                aria-label="Editar"
                onClick={() => onEdit(expense)}
              >
                <Pencil size={15} />
              </button>

              <form
                action={removeExpense}
                style={{ display: 'contents' }}
                onSubmit={(event) => {
                  if (!confirm('¿Eliminar este gasto?')) event.preventDefault();
                }}
              >
                <input type="hidden" name="id" value={expense.id} />
                <button type="submit" className="iconbtn danger" aria-label="Eliminar">
                  <Trash2 size={15} />
                </button>
              </form>
            </article>
          );
        })}
      </div>
    </div>
  );
}
