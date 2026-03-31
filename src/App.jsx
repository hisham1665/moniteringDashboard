import { useState } from 'react';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useSecurityData } from './hooks/useSecurityData';
import Sidebar from './components/Sidebar';
import StatsCards from './components/StatsCards';
import TrafficChart from './components/TrafficChart';
import ThreatChart from './components/ThreatChart';
import EventsTable from './components/EventsTable';
import TopIPs from './components/TopIPs';
import Onboarding from './components/Onboarding';
import AIInsightTab from './components/AIInsightTab';

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('sf_api_key') || '');
  const [timeRange, setTimeRange] = useState('24h');
  const [activeView, setActiveView] = useState('overview');

  const {
    events,
    stats,
    trafficData,
    threatData,
    severityData,
    topIPs,
    recentThreats,
    loading,
    error,
    refetch,
    isDemo,
    connectionStatus,
  } = useSecurityData(apiKey, timeRange);

  const handleSetApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('sf_api_key', key);
  };

  // Show onboarding if no API key
  if (!apiKey) {
    return <Onboarding onSubmit={handleSetApiKey} />;
  }

  return (
    <div className="app-layout">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        apiKey={apiKey}
        onLogout={() => handleSetApiKey('')}
      />
      <main className="main-content">
        {/* Header */}
        <div className="dashboard-header fade-in">
          <div>
            <h2>
              {activeView === 'overview' && 'Security Overview'}
              {activeView === 'traffic' && 'Traffic Monitor'}
              {activeView === 'threats' && 'Threat Intelligence'}
              {activeView === 'files' && 'File Security'}
              {activeView === 'ips' && 'IP Management'}
              {activeView === 'ai_insight' && 'AI Insight Report'}
            </h2>
            <p>Real-time security monitoring and threat analysis</p>
          </div>
          <div className="header-actions">
            <div className="live-indicator">
              <span className="live-dot" />
              LIVE
            </div>
            <div className="time-range-selector">
              {['1h', '6h', '24h', '7d', '30d'].map((range) => (
                <button
                  key={range}
                  className={timeRange === range ? 'active' : ''}
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </button>
              ))}
            </div>
            <button className="btn btn-ghost" onClick={refetch} title="Refresh data">
              <RefreshCw size={15} className={loading ? 'pulse' : ''} />
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="card fade-in" style={{ padding: '16px 22px', marginBottom: 20, borderColor: 'rgba(239,68,68,0.2)' }}>
            <span style={{ color: 'var(--accent-red)', fontWeight: 600 }}>⚠️ Error: </span>
            <span style={{ color: 'var(--text-secondary)' }}>{error}</span>
          </div>
        )}

        {/* Main Dashboard Content */}
        {activeView === 'overview' && (
          <>
            <StatsCards stats={stats} loading={loading} />
            <div className="charts-grid fade-in fade-in-delay-2">
              <TrafficChart data={trafficData} loading={loading} />
              <ThreatChart data={threatData} loading={loading} />
            </div>
            <div className="charts-grid-equal fade-in fade-in-delay-3">
              <TopIPs data={topIPs} loading={loading} />
              <EventsTable events={recentThreats} loading={loading} compact />
            </div>
          </>
        )}

        {activeView === 'traffic' && (
          <>
            <StatsCards stats={stats} loading={loading} />
            <div className="fade-in fade-in-delay-1" style={{ marginBottom: 24 }}>
              <TrafficChart data={trafficData} loading={loading} fullWidth />
            </div>
            <EventsTable
              events={events.filter((e) => e.event_type === 'request')}
              loading={loading}
              title="All Requests"
            />
          </>
        )}

        {activeView === 'threats' && (
          <>
            <StatsCards stats={stats} loading={loading} filter="threats" />
            <div className="charts-grid-equal fade-in fade-in-delay-1">
              <ThreatChart data={threatData} loading={loading} title="Threats by Type" />
              <ThreatChart data={severityData} loading={loading} title="By Severity" isSeverity />
            </div>
            <EventsTable
              events={recentThreats}
              loading={loading}
              title="Threat Log"
            />
          </>
        )}

        {activeView === 'files' && (
          <EventsTable
            events={events.filter((e) => e.event_type === 'file_scan')}
            loading={loading}
            title="File Scan History"
          />
        )}

        {activeView === 'ips' && (
          <>
            <div className="charts-grid-equal fade-in">
              <TopIPs data={topIPs} loading={loading} />
              <EventsTable
                events={events.filter((e) => e.event_type === 'ip_ban')}
                loading={loading}
                title="IP Bans"
                compact
              />
            </div>
            <EventsTable
              events={events.filter((e) => e.event_type === 'blocked')}
              loading={loading}
              title="Blocked Requests"
            />
          </>
        )}

        {activeView === 'ai_insight' && (
          <AIInsightTab events={events} stats={stats} />
        )}
      </main>
    </div>
  );
}
