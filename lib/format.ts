export function money(n: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(n);
}

/**
 * Parsea un importe escrito por el usuario (formato es-AR).
 *
 * Regla de separadores:
 * - Si aparecen coma y punto, el ÚLTIMO es el decimal y el otro es de miles.
 * - Solo comas: más de una => miles; una sola => decimal.
 * - Solo puntos: más de uno, o uno con exactamente 3 dígitos detrás => miles; si no, decimal.
 *
 * Devuelve NaN si el texto no contiene un número válido.
 */
export function parseAmount(raw: unknown): number {
  let s = String(raw ?? '').replace(/[^0-9.,]/g, '');
  if (!s) return NaN;

  const hasC = s.includes(',');
  const hasD = s.includes('.');

  if (hasC && hasD) {
    const dec = s.lastIndexOf(',') > s.lastIndexOf('.') ? ',' : '.';
    s = s.split(dec === ',' ? '.' : ',').join('').replace(dec, '.');
  } else if (hasC) {
    const p = s.split(',');
    s = p.length > 2 ? p.join('') : p[0] + '.' + p[1];
  } else if (hasD) {
    const p = s.split('.');
    if (p.length > 2 || (p.length === 2 && p[1].length === 3)) s = p.join('');
  }

  if (!/\d/.test(s)) return NaN;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}
