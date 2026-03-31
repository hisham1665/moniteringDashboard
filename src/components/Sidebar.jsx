import {
  LayoutDashboard,
  Activity,
  Shield,
  FileWarning,
  Ban,
  Brain,
  LogOut,
} from 'lucide-react';

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'traffic', label: 'Traffic', icon: Activity },
  { id: 'threats', label: 'Threats', icon: Shield },
  { id: 'files', label: 'File Security', icon: FileWarning },
  { id: 'ips', label: 'IP Management', icon: Ban },
  { id: 'ai_insight', label: 'AI Insight', icon: Brain },
];

export default function Sidebar({ activeView, setActiveView, apiKey, onLogout }) {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div>
          <h1>Vesper</h1>
          <span >Built in your hands , guarded in ours</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Monitor</div>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={activeView === item.id ? 'active' : ''}
            onClick={() => setActiveView(item.id)}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}

        <div className="sidebar-section-label" style={{ marginTop: 16 }}>
          Account
        </div>
        <button onClick={onLogout}>
          <LogOut size={18} />
          Disconnect
        </button>
      </nav>

      {/* Footer — API Key */}
      <div className="sidebar-footer">
        <div className="api-key-label">Project API Key</div>
        <div className="api-key-display">
          {apiKey ? `${apiKey.slice(0, 8)}••••${apiKey.slice(-4)}` : '—'}
        </div>
      </div>
    </aside>
  );
}
