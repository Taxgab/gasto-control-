'use client';

import { Search, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { allCategoryNames, categoryNames, SCOPES } from '@/lib/categories';
import type { Scope } from '@/lib/types';

interface FiltersBarProps {
  month: string;
  scope?: Scope;
  category?: string;
  query?: string;
}

type FilterKey = 'month' | 'scope' | 'category' | 'q';

export default function FiltersBar({ month, scope, category, query }: FiltersBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [term, setTerm] = useState(query ?? '');

  /**
   * Reconstruye la query string a partir de los valores actuales (que llegan
   * como props del server) + el cambio. Evita `useSearchParams` y su Suspense.
   */
  function apply(next: Partial<Record<FilterKey, string>>) {
    const merged = {
      month,
      scope: scope ?? '',
      category: category ?? '',
      q: query ?? '',
      ...next,
    };
    const params = new URLSearchParams();
    params.set('month', merged.month);
    if (merged.scope) params.set('scope', merged.scope);
    if (merged.category) params.set('category', merged.category);
    if (merged.q) params.set('q', merged.q);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const categoryOptions = scope ? categoryNames(scope) : allCategoryNames();

  function onSearch(event: FormEvent) {
    event.preventDefault();
    apply({ q: term.trim() });
  }

  return (
    <div className="toolbar" style={{ flexWrap: 'wrap' }}>
      <input
        type="month"
        value={month}
        onChange={(event) => apply({ month: event.target.value })}
        aria-label="Mes"
      />
      <select
        value={scope ?? ''}
        onChange={(event) => apply({ scope: event.target.value, category: '' })}
        aria-label="Ámbito"
      >
        <option value="">Todos los ámbitos</option>
        {SCOPES.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select
        value={category ?? ''}
        onChange={(event) => apply({ category: event.target.value })}
        aria-label="Categoría"
      >
        <option value="">Todas las categorías</option>
        {categoryOptions.map((name) => (
          <option key={name}>{name}</option>
        ))}
      </select>
      <form className="search" onSubmit={onSearch} style={{ display: 'flex', alignItems: 'center' }}>
        <button type="submit" className="iconbtn" aria-label="Buscar">
          <Search size={16} />
        </button>
        <input
          placeholder="Buscar"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          aria-label="Buscar"
        />
        {term ? (
          <button
            type="button"
            className="iconbtn"
            aria-label="Limpiar búsqueda"
            onClick={() => {
              setTerm('');
              apply({ q: '' });
            }}
          >
            <X size={14} />
          </button>
        ) : null}
      </form>
    </div>
  );
}
