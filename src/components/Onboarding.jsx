import { useState } from 'react';
import { KeyRound } from 'lucide-react';

export default function Onboarding({ onSubmit }) {
  const [key, setKey] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (key.trim()) onSubmit(key.trim());
  };

  return (
    <div className="onboarding">
      <div className="onboarding-card fade-in">
        <div className="logo-large">🛡️</div>
        <h2>SecureFlow Dashboard</h2>
        <p>
          Connect your application's security events by entering your project API key.
          This key links <strong>secure-flow</strong> middleware to this dashboard.
        </p>

        <div className="code-snippet">
          <span className="comment">// In your Express app</span>
          <br />
          <span className="keyword">const</span> {'{ secureFlow, SupabaseAdapter }'} ={' '}
          <span className="keyword">require</span>(
          <span className="string">'secure-flow'</span>);
          <br />
          <br />
          <span className="keyword">const</span> adapter ={' '}
          <span className="keyword">new</span> SupabaseAdapter({'{'}
          <br />
          {'  '}supabaseUrl: <span className="string">'your-url'</span>,
          <br />
          {'  '}supabaseKey: <span className="string">'your-key'</span>,
          <br />
          {'  '}apiKey: <span className="string">'your-api-key'</span>,
          <br />
          {'}'});
          <br />
          <br />
          app.use(secureFlow({'{'} supabaseAdapter: adapter {'}'}));
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter your project API key..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn btn-primary" disabled={!key.trim()}>
            <KeyRound size={16} />
            Connect Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
