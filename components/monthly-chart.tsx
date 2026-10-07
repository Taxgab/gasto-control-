import { monthLabel } from '@/lib/dates';
import type { TrendPoint } from '@/lib/expenses';
import { money } from '@/lib/format';

/**
 * Gráfico de evolución en SVG/CSS puro: sin librería de charts para 6 puntos.
 */
export default function MonthlyChart({ trend }: { trend: TrendPoint[] }) {
  if (trend.length === 0) return null;
  const max = Math.max(...trend.map((point) => point.total), 1);
  const last = trend[trend.length - 1];

  return (
    <div className="card">
      <div className="cardtitle">
        <div>
          <span className="eyebrow">EVOLUCIÓN</span>
          <h2>Últimos {trend.length} meses</h2>
        </div>
        <span className="count">{money(last.total)}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 150 }}>
        {trend.map((point) => (
          <div
            key={point.month}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <div
              title={`${monthLabel(point.month)}: ${money(point.total)}`}
              style={{
                width: '100%',
                height: `${Math.max(3, (point.total / max) * 110)}px`,
                background: point.month === last.month ? 'var(--accent)' : 'var(--soft)',
                borderRadius: 6,
              }}
            />
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>
              {monthLabel(point.month).slice(0, 3)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
