import {describe,it,expect} from 'vitest';
import {money,parseAmount} from './format';

describe('parseAmount (formato es-AR)',()=>{
  it.each([
    ['1.500',1500],
    ['1.500,50',1500.5],
    ['1,500.50',1500.5],
    ['1.5',1.5],
    ['1,5',1.5],
    ['1500',1500],
    ['1500,50',1500.5],
    ['1.500.000',1500000],
    ['$ 1.500',1500],
    ['1.234.567,89',1234567.89],
    ['0,01',0.01],
    [',50',0.5],
    ['1.50',1.5],
    ['123.456',123456],
    ['1,500',1.5],
    ['12.5',12.5],
    ['1.2.3',123],
  ])('interpreta %s como %s',(input,expected)=>{
    expect(parseAmount(input)).toBe(expected);
  });

  it.each([['abc'],[''],['   '],['$'],['...'],[','],['sin numero'],[null],[undefined]])(
    'rechaza %s devolviendo NaN',
    (input)=>{
      expect(parseAmount(input)).toBeNaN();
    }
  );

  it('no comete el bug histórico de 10x con decimales',()=>{
    expect(parseAmount('1.5')).not.toBe(15);
    expect(parseAmount('1.5')).toBe(1.5);
  });
});

describe('money',()=>{
  it('formatea en ARS sin decimales',()=>{
    expect(money(1500)).toContain('1.500');
  });
});
