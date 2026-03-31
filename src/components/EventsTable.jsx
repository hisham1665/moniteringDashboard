import { format } from 'date-fns';
import { List, AlertTriangle } from 'lucide-react';

const eventBadge = (type) => {
  const map = {
    request: 'badge-request',
    threat: 'badge-threat',
    blocked: 'badge-blocked',
    rate_limit: 'badge-rate',
    file_scan: 'badge-file',
    ip_ban: 'badge-ban',
  };
  return map[type] || 'badge-request';
};

const severityBadge = (severity) => {
  if (!severity) return '';
  return `badge-severity-${severity}`;
};

const riskLevel = (score) => {
  if (score >= 80) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
};

export default function EventsTable({ events, loading, title, compact }) {
  const tableTitle = title || 'Recent Security Events';
  const displayEvents = compact ? events.slice(0, 8) : events.slice(0, 100);

  return (
    <div className="card fade-in">
      <div className="card-header">
        <span className="card-title">
          <List size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          {tableTitle}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {events.length} event{events.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="card-body">
        {loading && events.length === 0 ? (
          <div>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="skeleton"
                style={{ height: 36, marginBottom: 8, width: '100%' }}
              />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px 20px' }}>
            <div className="empty-icon">
              <AlertTriangle size={28} style={{ color: 'var(--text-muted)' }} />
            </div>
            <h3>No events found</h3>
            <p>Events will appear here once your application sends data via secure-flow.</p>
          </div>
        ) : (
          <div className="events-table-wrapper">
            <table className="events-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Type</th>
                  <th>IP</th>
                  {!compact && <th>Method</th>}
                  <th>Path</th>
                  {!compact && <th>Severity</th>}
                  <th>Risk</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {displayEvents.map((event, idx) => (
                  <tr key={event.id || idx}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                      {event.created_at
                        ? format(new Date(event.created_at), 'HH:mm:ss')
                        : '—'}
                    </td>
                    <td>
                      <span className={`badge ${eventBadge(event.event_type)}`}>
                        {event.event_type || '—'}
                      </span>
                    </td>
                    <td style={{ fontFamily: "'Courier New', monospace", fontSize: '0.78rem' }}>
                      {event.ip || '—'}
                    </td>
                    {!compact && (
                      <td>
                        <span style={{ fontWeight: 600, fontSize: '0.78rem' }}>
                          {event.method || '—'}
                        </span>
                      </td>
                    )}
                    <td
                      style={{
                        maxWidth: compact ? 120 : 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: '0.78rem',
                      }}
                      title={event.path}
                    >
                      {event.path || '—'}
                    </td>
                    {!compact && (
                      <td>
                        {event.severity ? (
                          <span className={`badge ${severityBadge(event.severity)}`}>
                            {event.severity}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    )}
                    <td>
                      <span style={{ fontWeight: 600, fontSize: '0.78rem' }}>
                        {event.risk_score ?? 0}
                      </span>
                      <span className="risk-bar">
                        <span
                          className={`risk-bar-fill ${riskLevel(event.risk_score || 0)}`}
                          style={{ width: `${Math.min(event.risk_score || 0, 100)}%` }}
                        />
                      </span>
                    </td>
                    <td>
                      {event.action ? (
                        <span
                          className={`badge ${
                            event.action === 'block' || event.action === 'ban'
                              ? 'badge-blocked'
                              : 'badge-allow'
                          }`}
                        >
                          {event.action}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
