import type { Comparison } from '@/lib/expenses';
import { money } from '@/lib/format';

export default function ComparisonCard({ comparison }: { comparison: Comparison }) {
  const rows = [
    { label: 'Mes actual', value: comparison.current },
    { label: 'Mes anterior', value: comparison.previous },
    { label: 'Promedio 3 meses', value: comparison.avg3 },
    { label: 'Promedio 6 meses', value: comparison.avg6 },
  ];
  const { deltaPct } = comparison;

  return (
    <div className="card">
      <div className="cardtitle">
        <div>
          <span className="eyebrow">COMPARACIÓN</span>
          <h2>Contra meses previos</h2>
        </div>
      </div>

      {rows.map((row, index) => (
        <div
          key={row.label}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            padding: '7px 0',
            borderTop: index === 0 ? 'none' : '1px solid var(--line)',
          }}
        >
          <span style={{ color: 'var(--muted)', fontSize: 13 }}>{row.label}</span>
          <b>{money(row.value)}</b>
        </div>
      ))}

      {deltaPct !== null ? (
        <div
          style={{
            marginTop: 10,
            fontSize: 13,
            fontWeight: 600,
            color: deltaPct >= 0 ? '#b45309' : '#15803d',
          }}
        >
          {deltaPct >= 0 ? '▲' : '▼'} {Math.abs(deltaPct).toFixed(1)}% vs mes anterior
        </div>
      ) : null}
    </div>
  );
}
