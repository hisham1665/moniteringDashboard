import React from 'react';

const AIExplanationPanel = ({ explanation }) => {
  if (!explanation) return null;

  const severityColor = 
    explanation.severity?.toLowerCase() === 'critical' ? 'var(--accent-red)' :
    explanation.severity?.toLowerCase() === 'high' ? 'var(--accent-orange)' :
    explanation.severity?.toLowerCase() === 'medium' ? 'var(--accent-yellow, #facc15)' :
    'var(--accent-green)';

  return (
    <div className="card fade-in" style={{ position: 'relative', overflow: 'hidden', padding: '24px', marginBottom: '24px', border: '1px solid rgba(139, 92, 246, 0.3)', boxShadow: '0 0 40px rgba(139, 92, 246, 0.1)' }}>
      {/* Glow Effect */}
      <div style={{
        position: 'absolute', top: -50, right: -50, width: 150, height: 150,
        background: 'rgba(139, 92, 246, 0.15)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none'
      }}></div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px', marginBottom: '20px' }}>
        <h3 className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          ✨ AI Security Insight
        </h3>
        
        <span style={{
          padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600,
          border: `1px solid ${severityColor}`, color: severityColor, background: 'rgba(0,0,0,0.2)'
        }}>
          ⚠️ Severity: {explanation.severity || 'Unknown'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        
        <div>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: 'var(--accent-red)' }}>🔴</span> Threat Detected</h4>
          <div style={{ background: 'var(--bg-glass)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}>
            {explanation.threat}
          </div>
        </div>

        <div>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: 'var(--accent-blue)' }}>📖</span> Analysis</h4>
          <p style={{ lineHeight: '1.6' }}>{explanation.explanation}</p>
        </div>

        <div>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: 'var(--accent-orange)' }}>💥</span> Potential Impact</h4>
          <p style={{ lineHeight: '1.6' }}>{explanation.impact}</p>
        </div>

        <div>
           <h4 style={{ color: 'var(--text-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: 'var(--accent-green)' }}>🛡️</span> Action Taken</h4>
           <p style={{ lineHeight: '1.6', color: 'var(--accent-green)' }}>{explanation.action_taken}</p>
        </div>

        <div style={{ background: 'rgba(139, 92, 246, 0.05)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(139, 92, 246, 0.2)', marginTop: '8px' }}>
          <h4 style={{ color: 'var(--accent-purple)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><span>💡</span> Recommendation</h4>
          <p style={{ lineHeight: '1.6', color: 'var(--text-primary)' }}>{explanation.recommendation}</p>
        </div>

      </div>
    </div>
  );
};

export default AIExplanationPanel;
