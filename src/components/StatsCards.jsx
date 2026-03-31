import {
  Activity,
  ShieldAlert,
  Ban,
  Zap,
  Clock,
  AlertTriangle,
} from 'lucide-react';

const allCards = [
  {
    key: 'requests',
    label: 'Requests',
    icon: Zap,
    color: 'blue',
    getValue: (s) => s.requests.toLocaleString(),
  },
  {
    key: 'threats',
    label: 'Threats Detected',
    icon: ShieldAlert,
    color: 'orange',
    getValue: (s) => s.threats.toLocaleString(),
  },
  {
    key: 'blocked',
    label: 'Blocked',
    icon: Ban,
    color: 'red',
    getValue: (s) => s.blocked.toLocaleString(),
  },
  {
    key: 'avgRisk',
    label: 'Avg Risk Score',
    icon: AlertTriangle,
    color: 'purple',
    getValue: (s) => s.avgRisk,
  },
  {
    key: 'avgResponse',
    label: 'Avg Response',
    icon: Clock,
    color: 'green',
    getValue: (s) => `${s.avgResponseTime}ms`,
  },
];

export default function StatsCards({ stats, loading, filter }) {
  let cards = allCards;
  if (filter === 'threats') {
    cards = allCards.filter((c) =>
      ['threats', 'blocked', 'avgRisk', 'total'].includes(c.key)
    );
  }

  if (loading && !stats.total) {
    return (
      <div className="stats-grid fade-in">
        {cards.map((card) => (
          <div key={card.key} className={`stat-card ${card.color}`}>
            <div className="stat-icon">
              <card.icon size={20} />
            </div>
            <div className="skeleton" style={{ width: 80, height: 32, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: 100, height: 14 }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="stats-grid fade-in">
      {cards.map((card, i) => (
        <div
          key={card.key}
          className={`stat-card ${card.color} fade-in`}
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="stat-icon">
            <card.icon size={20} />
          </div>
          <div className="stat-value">{card.getValue(stats)}</div>
          <div className="stat-label">{card.label}</div>
        </div>
      ))}
    </div>
  );
}
