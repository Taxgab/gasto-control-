import { scopeLabel } from '@/lib/categories';
import type { ScopeSummaryRow } from '@/lib/expenses';
import { money } from '@/lib/format';

export default function ScopeSummary({ rows }: { rows: ScopeSummaryRow[] }) {
  if (rows.length === 0) return null;

  return (
    <div className="card">
      <div className="cardtitle">
        <div>
          <span className="eyebrow">DISTRIBUCIÓN</span>
          <h2>Por ámbito</h2>
        </div>
      </div>
      {rows.map((row) => (
        <div className="barrow" key={row.scope}>
          <div>
            <span>{scopeLabel(row.scope)}</span>
            <b>
              {money(row.total)}{' '}
              <small style={{ color: 'var(--muted)', fontWeight: 400 }}>{row.pct.toFixed(0)}%</small>
            </b>
          </div>
          <div className="bar">
            <i style={{ width: `${Math.max(2, row.pct)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
