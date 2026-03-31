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
  '#ef4444', '#f59e0b', '#ec4899', '#8b5cf6',
  '#3b82f6', '#00d4ff', '#10b981', '#f97316',
];

const SEVERITY_COLORS = {
  critical: '#ef4444',
  high: '#f59e0b',
  medium: '#dba74a',
  low: '#00d4ff',
  none: '#555a70',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        background: 'rgba(10,10,20,0.95)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10,
        padding: '10px 14px',
        fontSize: '0.8rem',
        backdropFilter: 'blur(16px)',
      }}
    >
      <div style={{ fontWeight: 600, color: '#e8eaf0', marginBottom: 3 }}>{d.name}</div>
      <div style={{ color: payload[0].color || '#00d4ff', fontWeight: 700 }}>
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
          <Shield size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          {chartTitle}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
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
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
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
