import type { Insight } from '@/lib/insights';

const COLORS: Record<Insight['tone'], string> = {
  up: '#b45309',
  down: '#15803d',
  info: 'var(--ink)',
};

export default function Insights({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) return null;

  return (
    <div className="card">
      <div className="cardtitle">
        <div>
          <span className="eyebrow">INSIGHTS</span>
          <h2>Qué mirar</h2>
        </div>
      </div>
      <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {insights.map((insight, index) => (
          <li key={index} style={{ color: COLORS[insight.tone] }}>
            {insight.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
