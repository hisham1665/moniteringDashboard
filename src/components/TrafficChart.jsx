import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format } from 'date-fns';
import { Activity } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: 'rgba(10,10,20,0.95)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10,
        padding: '12px 16px',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{ fontSize: '0.72rem', color: '#8a8fa8', marginBottom: 8 }}>
        {label ? format(new Date(label), 'MMM dd, HH:mm') : '—'}
      </div>
      {payload.map((entry) => (
        <div
          key={entry.name}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '0.8rem',
            marginBottom: 3,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: entry.color,
              display: 'inline-block',
            }}
          />
          <span style={{ color: '#e8eaf0' }}>{entry.name}:</span>
          <span style={{ color: entry.color, fontWeight: 700 }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function TrafficChart({ data, loading, fullWidth }) {
  return (
    <div className="card" style={fullWidth ? {} : {}}>
      <div className="card-header">
        <span className="card-title">
          <Activity size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Traffic Overview
        </span>
        <span className="live-indicator">
          <span className="live-dot" /> LIVE
        </span>
      </div>
      <div className="card-body">
        {loading && (!data || data.length === 0) ? (
          <div className="skeleton" style={{ width: '100%', height: 260 }} />
        ) : data.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 20px' }}>
            <p style={{ color: 'var(--text-muted)' }}>No traffic data yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                tickFormatter={(t) => format(new Date(t), 'HH:mm')}
                tick={{ fontSize: 11 }}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '0.75rem', paddingTop: 8 }}
                iconType="circle"
                iconSize={8}
              />
              <Area
                type="monotone"
                dataKey="requests"
                name="Requests"
                stroke="#00d4ff"
                strokeWidth={2}
                fill="url(#colorRequests)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="threats"
                name="Threats"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#colorThreats)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="blocked"
                name="Blocked"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#colorBlocked)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
