import React from 'react';

const AIExplanationPanel = ({ explanation }) => {
  if (!explanation) return null;

  const severityColor = 
    explanation.severity?.toLowerCase() === 'critical' ? '#ef4444' :
    explanation.severity?.toLowerCase() === 'high' ? '#ef4444' :
    explanation.severity?.toLowerCase() === 'medium' ? '#eab308' :
    '#4ade80';

  return (
    <div className="card fade-in card-ai-glow" style={{ 
      position: 'relative', 
      overflow: 'hidden', 
      padding: '28px', 
      marginBottom: '24px', 
      border: '1px solid rgba(168, 85, 247, 0.15)',
    }}>
      {/* Glow Effect */}
      <div style={{
        position: 'absolute', top: -40, right: -40, width: 140, height: 140,
        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
        pointerEvents: 'none'
      }}></div>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        borderBottom: '1px solid rgba(255,255,255,0.04)', 
        paddingBottom: '16px', 
        marginBottom: '20px' 
      }}>
        <h3 style={{ 
          margin: 0, 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          background: 'linear-gradient(135deg, #3b82f6, #a855f7)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent',
          fontSize: '1.1rem',
          fontWeight: 700
        }}>
          ✨ AI Security Insight
        </h3>
        
        <span style={{
          padding: '4px 14px', 
          borderRadius: 999, 
          fontSize: '0.73rem', 
          fontWeight: 600,
          border: `1px solid ${severityColor}30`, 
          color: severityColor, 
          background: `${severityColor}10`
        }}>
          Severity: {explanation.severity || 'Unknown'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', fontSize: '0.9rem', color: '#a1a1aa' }}>
        
        <div>
          <h4 style={{ color: '#fafafa', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 600 }}>
            <span style={{ color: '#ef4444' }}>🔴</span> Threat Detected
          </h4>
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.04)', 
            padding: '12px 16px', 
            borderRadius: '10px', 
            border: '1px solid rgba(239, 68, 68, 0.08)', 
            color: '#f4f4f5',
            lineHeight: '1.6'
          }}>
            {explanation.threat}
          </div>
        </div>

        <div>
          <h4 style={{ color: '#fafafa', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 600 }}>
            <span style={{ color: '#3b82f6' }}>📖</span> Analysis
          </h4>
          <p style={{ lineHeight: '1.7', margin: 0 }}>{explanation.explanation}</p>
        </div>

        <div>
          <h4 style={{ color: '#fafafa', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 600 }}>
            <span style={{ color: '#eab308' }}>💥</span> Potential Impact
          </h4>
          <p style={{ lineHeight: '1.7', margin: 0 }}>{explanation.impact}</p>
        </div>

        <div>
          <h4 style={{ color: '#fafafa', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 600 }}>
            <span style={{ color: '#22c55e' }}>🛡️</span> Action Taken
          </h4>
          <p style={{ lineHeight: '1.7', color: '#4ade80', margin: 0 }}>{explanation.action_taken}</p>
        </div>

        <div style={{ 
          background: 'rgba(168, 85, 247, 0.04)', 
          padding: '18px 20px', 
          borderRadius: '12px', 
          border: '1px solid rgba(168, 85, 247, 0.1)', 
          marginTop: '4px' 
        }}>
          <h4 style={{ 
            color: '#a855f7', 
            marginBottom: '6px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontSize: '0.88rem',
            fontWeight: 600
          }}>
            <span>💡</span> Recommendation
          </h4>
          <p style={{ lineHeight: '1.7', color: '#f4f4f5', margin: 0 }}>{explanation.recommendation}</p>
        </div>

      </div>
    </div>
  );
};

export default AIExplanationPanel;
