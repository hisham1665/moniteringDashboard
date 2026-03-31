import { Globe } from 'lucide-react';

const riskColor = (score) => {
  if (score >= 80) return '#ef4444';
  if (score >= 50) return '#eab308';
  return '#4ade80';
};

export default function TopIPs({ data, loading }) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">
          <Globe size={14} style={{ marginRight: 8, verticalAlign: 'middle', color: '#a855f7' }} />
          Top Threat IPs
        </span>
        <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
          {data.length} IP{data.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="card-body">
        {loading && data.length === 0 ? (
          <div>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="skeleton"
                style={{ height: 40, marginBottom: 8, width: '100%' }}
              />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px 20px' }}>
            <p style={{ color: 'var(--text-muted)' }}>No suspicious IPs detected</p>
          </div>
        ) : (
          <div>
            {data.map((item, idx) => (
              <div
                key={item.ip}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 4px',
                  borderBottom:
                    idx < data.length - 1
                      ? '1px solid rgba(255,255,255,0.03)'
                      : 'none',
                  transition: 'background 150ms ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: idx < 3 ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: idx < 3 ? '#ef4444' : '#3b82f6',
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      fontSize: '0.82rem',
                      color: '#f4f4f5',
                    }}
                  >
                    {item.ip}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span
                    style={{
                      fontSize: '0.78rem',
                      color: '#52525b',
                    }}
                  >
                    {item.count} hit{item.count !== 1 ? 's' : ''}
                  </span>
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: riskColor(item.maxRisk),
                      minWidth: 30,
                      textAlign: 'right',
                    }}
                  >
                    {item.maxRisk}
                  </span>
                  <span className="risk-bar">
                    <span
                      className={`risk-bar-fill ${
                        item.maxRisk >= 80 ? 'high' : item.maxRisk >= 40 ? 'medium' : 'low'
                      }`}
                      style={{ width: `${Math.min(item.maxRisk, 100)}%` }}
                    />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
