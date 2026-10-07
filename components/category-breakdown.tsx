import type { CategorySummaryRow } from '@/lib/expenses';
import { money } from '@/lib/format';

export default function CategoryBreakdown({ rows }: { rows: CategorySummaryRow[] }) {
  if (rows.length === 0) return null;
  const max = rows[0].total || 1;

  return (
    <div className="card">
      <div className="cardtitle">
        <div>
          <span className="eyebrow">CATEGORÍAS</span>
          <h2>Ranking del mes</h2>
        </div>
      </div>
      {rows.map((row) => (
        <div className="barrow" key={row.category}>
          <div>
            <span>{row.category}</span>
            <b>
              {money(row.total)}{' '}
              <small style={{ color: 'var(--muted)', fontWeight: 400 }}>{row.pct.toFixed(0)}%</small>
            </b>
          </div>
          <div className="bar">
            <i style={{ width: `${Math.max(2, (row.total / max) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
