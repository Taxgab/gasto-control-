import type { ExpenseOrigin, PaymentMethod, Scope } from './types';

export interface Option<T extends string> {
  value: T;
  label: string;
}

/** Ámbitos. El `value` es lo que se guarda en la DB; el `label` es lo que se ve. */
export const SCOPES: readonly Option<Scope>[] = [
  { value: 'personal', label: 'Personal' },
  { value: 'carpinteria', label: 'Carpintería El Roble' },
  { value: 'father', label: 'Padre' },
  { value: 'other', label: 'Otros' },
];

export const PAYMENT_METHODS: readonly Option<PaymentMethod>[] = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'debit', label: 'Débito' },
  { value: 'credit', label: 'Crédito' },
  { value: 'transfer', label: 'Transferencia' },
  { value: 'other', label: 'Otro' },
];

export const ORIGINS: readonly Option<ExpenseOrigin>[] = [
  { value: 'manual', label: 'Manual' },
  { value: 'card_statement', label: 'Resumen de tarjeta' },
  { value: 'receipt', label: 'Ticket' },
  { value: 'import', label: 'Importación' },
];

/** Categoría -> subcategorías. */
export type CategoryTree = Record<string, readonly string[]>;

const PERSONAL_CATEGORIES: CategoryTree = {
  Alimentación: ['Supermercado', 'Restaurante', 'Delivery', 'Cafetería', 'Otros'],
  Hogar: ['Servicios', 'Compras', 'Mantenimiento', 'Otros'],
  Automóvil: ['Combustible', 'Seguro', 'Patente', 'Mantenimiento', 'Otros'],
  Salud: ['Medicamentos', 'Consultas', 'Estudios', 'Otros'],
  Familia: ['Colegio', 'Ropa', 'Actividades', 'Otros'],
  Ocio: ['Suscripciones', 'Salidas', 'Entretenimiento', 'Otros'],
  Otros: ['Otros'],
};

const CARPINTERIA_CATEGORIES: CategoryTree = {
  Materiales: ['Melamina', 'Madera', 'Herrajes', 'Otros'],
  Herramientas: ['Herramientas', 'Insumos', 'Mantenimiento', 'Otros'],
  Movilidad: ['Combustible', 'Fletes', 'Peajes', 'Otros'],
  Servicios: ['Servicios', 'Taller', 'Otros'],
  Otros: ['Otros'],
};

/**
 * Árbol de categorías por ámbito.
 * TODO(V2): definir categorías propias para `father` y `other`.
 * Por ahora reutilizan las de Personal (supuesto a confirmar).
 */
export const CATEGORIES: Record<Scope, CategoryTree> = {
  personal: PERSONAL_CATEGORIES,
  carpinteria: CARPINTERIA_CATEGORIES,
  father: PERSONAL_CATEGORIES,
  other: PERSONAL_CATEGORIES,
};

export function categoryNames(scope: Scope): string[] {
  return Object.keys(CATEGORIES[scope]);
}

/** Categorías únicas de todos los ámbitos, para el filtro sin ámbito elegido. */
export function allCategoryNames(): string[] {
  const names = new Set<string>();
  for (const tree of Object.values(CATEGORIES)) {
    for (const name of Object.keys(tree)) names.add(name);
  }
  return [...names].sort((a, b) => a.localeCompare(b, 'es'));
}

export function subcategoryNames(scope: Scope, category: string): string[] {
  return [...(CATEGORIES[scope][category] ?? [])];
}

export function scopeLabel(scope: Scope): string {
  return SCOPES.find((s) => s.value === scope)?.label ?? scope;
}

export function paymentLabel(method: PaymentMethod | null | undefined): string {
  if (!method) return '';
  return PAYMENT_METHODS.find((p) => p.value === method)?.label ?? method;
}
