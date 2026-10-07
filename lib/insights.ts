import { scopeLabel } from './categories';
import type { Comparison, MonthSummary } from './expenses';

export interface Insight {
  text: string;
  tone: 'up' | 'down' | 'info';
}

const percent = (n: number) => `${Math.abs(n).toFixed(0)}%`;

/**
 * Reglas simples para destacar lo relevante del mes. La app presenta
 * información; NO toma decisiones. Máximo 4 insights.
 */
export function buildInsights(summary: MonthSummary, comparison: Comparison): Insight[] {
  if (summary.count === 0) {
    return [{ text: 'Todavía no registraste gastos este mes.', tone: 'info' }];
  }

  const insights: Insight[] = [];
  const { deltaPct, current, avg3 } = comparison;

  if (deltaPct !== null && Math.abs(deltaPct) >= 10) {
    insights.push({
      text: `El gasto del mes ${deltaPct > 0 ? 'subió' : 'bajó'} ${percent(deltaPct)} respecto al mes anterior.`,
      tone: deltaPct > 0 ? 'up' : 'down',
    });
  }

  if (avg3 > 0 && current > avg3 * 1.1) {
    insights.push({
      text: `Estás ${percent(((current - avg3) / avg3) * 100)} por encima del promedio de los últimos 3 meses.`,
      tone: 'up',
    });
  } else if (avg3 > 0 && current < avg3 * 0.9) {
    insights.push({
      text: `Estás ${percent(((current - avg3) / avg3) * 100)} por debajo del promedio de los últimos 3 meses.`,
      tone: 'down',
    });
  }

  const topScope = summary.byScope[0];
  if (topScope && topScope.pct >= 40) {
    insights.push({
      text: `${scopeLabel(topScope.scope)} representa el ${topScope.pct.toFixed(0)}% del gasto del mes.`,
      tone: 'info',
    });
  }

  const topCategory = summary.byCategory[0];
  if (topCategory && topCategory.pct >= 35) {
    insights.push({
      text: `${topCategory.category} concentra el ${topCategory.pct.toFixed(0)}% del gasto del mes.`,
      tone: 'info',
    });
  }

  return insights.slice(0, 4);
}
