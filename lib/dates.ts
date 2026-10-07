/**
 * Helpers de mes. En GastoControl el mes NO se almacena: se deriva siempre de
 * `expense_date` ('YYYY-MM-DD'). Todas las funciones trabajan en UTC para no
 * depender del timezone del servidor.
 */

/** Mes actual en formato 'YYYY-MM' (UTC). */
export function currentMonth(now: Date = new Date()): string {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

/** 'YYYY-MM-DD' -> 'YYYY-MM' */
export function monthOf(date: string): string {
  return date.slice(0, 7);
}

/** Primer y último día (inclusive) de un mes 'YYYY-MM'. */
export function monthRange(month: string): { start: string; end: string } {
  const [year, m] = month.split('-').map(Number);
  const lastDay = new Date(Date.UTC(year, m, 0)).getUTCDate();
  return {
    start: `${month}-01`,
    end: `${month}-${String(lastDay).padStart(2, '0')}`,
  };
}

/** Suma (o resta, con delta negativo) meses a un 'YYYY-MM'. */
export function addMonths(month: string, delta: number): string {
  const [year, m] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, m - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

/** Los últimos `count` meses terminando en `month`, en orden cronológico. */
export function lastMonths(month: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => addMonths(month, -(count - 1 - i)));
}

/** 'YYYY-MM' -> 'octubre de 2026' (es-AR). */
export function monthLabel(month: string): string {
  const [year, m] = month.split('-').map(Number);
  return new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    year: 'numeric',
    // Sin timeZone fijo, una fecha UTC a las 00:00 se interpreta como el día
    // anterior en husos detrás de UTC (ej. Argentina UTC-3) y devuelve el mes
    // equivocado.
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, m - 1, 1)));
}
