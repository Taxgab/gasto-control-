import { describe, it, expect } from 'vitest';
import { addMonths, lastMonths, monthLabel, monthOf, monthRange } from './dates';

describe('monthOf', () => {
  it('extrae el mes de una fecha', () => {
    expect(monthOf('2026-10-07')).toBe('2026-10');
  });
});

describe('monthRange', () => {
  it('devuelve el primer y último día de un mes de 31 días', () => {
    expect(monthRange('2026-10')).toEqual({ start: '2026-10-01', end: '2026-10-31' });
  });
  it('maneja febrero en año bisiesto', () => {
    expect(monthRange('2028-02')).toEqual({ start: '2028-02-01', end: '2028-02-29' });
  });
  it('maneja febrero en año no bisiesto', () => {
    expect(monthRange('2026-02')).toEqual({ start: '2026-02-01', end: '2026-02-28' });
  });
});

describe('addMonths', () => {
  it('resta cruzando el año', () => {
    expect(addMonths('2026-01', -1)).toBe('2025-12');
  });
  it('suma cruzando el año', () => {
    expect(addMonths('2026-12', 1)).toBe('2027-01');
  });
  it('suma varios meses', () => {
    expect(addMonths('2026-10', -6)).toBe('2026-04');
  });
});

describe('lastMonths', () => {
  it('devuelve meses en orden cronológico', () => {
    expect(lastMonths('2026-10', 3)).toEqual(['2026-08', '2026-09', '2026-10']);
  });
});

describe('monthLabel', () => {
  it('formatea en español', () => {
    expect(monthLabel('2026-10').toLowerCase()).toContain('octubre');
  });
});
