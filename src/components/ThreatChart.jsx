import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Shield } from 'lucide-react';

const THREAT_COLORS = [
  '#ef4444', '#eab308', '#f97316', '#a855f7',
  '#3b82f6', '#22d3ee', '#22c55e', '#ec4899',
];

const SEVERITY_COLORS = {
  critical: '#ef4444',
  high: '#ef4444',
  medium: '#eab308',
  low: '#4ade80',
  none: '#52525b',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        background: 'rgba(9, 9, 11, 0.95)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: '12px 16px',
        fontSize: '0.8rem',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ fontWeight: 600, color: '#fafafa', marginBottom: 3 }}>{d.name}</div>
      <div style={{ color: payload[0].color || '#3b82f6', fontWeight: 700 }}>
        {d.value} event{d.value !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default function ThreatChart({ data, loading, title, isSeverity }) {
  const chartTitle = title || 'Threat Breakdown';

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">
          <Shield size={14} style={{ marginRight: 8, verticalAlign: 'middle', color: '#ef4444' }} />
          {chartTitle}
        </span>
        <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
          {data.length} type{data.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="card-body">
        {loading && data.length === 0 ? (
          <div className="skeleton" style={{ width: '100%', height: 260 }} />
        ) : data.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 20px' }}>
            <p style={{ color: 'var(--text-muted)' }}>No threats detected 🎉</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 4, right: 20, left: 10, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 11 }}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59,130,246,0.03)' }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={24}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      isSeverity
                        ? SEVERITY_COLORS[entry.name] || THREAT_COLORS[0]
                        : THREAT_COLORS[index % THREAT_COLORS.length]
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
