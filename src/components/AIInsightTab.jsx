import React, { useState, useRef, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Sparkles, Brain, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';
import AIExplanationPanel from './AIExplanationPanel';

const AIInsightTab = ({ events, stats }) => {
  // Use useRef alongside useState to prevent state loss on re-renders
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const reportRef = useRef(null);
  const mountedRef = useRef(true);

  // Keep mountedRef updated
  React.useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const generateReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    setReport(null);
    reportRef.current = null;

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('VITE_GEMINI_API_KEY is not defined in the environment.');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
        }
      });

      const recentThreats = events
        .filter(e => e.event_type === 'threat' || e.event_type === 'blocked' || e.event_type === 'file_scan')
        .slice(0, 50)
        .map(e => ({
          ip: e.ip,
          type: e.threat_type || e.event_type,
          path: e.path || e.details?.filename,
          action: e.action || 'blocked',
          score: e.risk_score
        }));

      const prompt = `You are a helpful, easy-to-understand security assistant. Analyze this website's recent security data and write a simple, friendly report for a non-technical user (like a small business owner). Do not use heavy jargon or complex terms. Explain any threats using simple real-world analogies (like "someone trying to pick the lock on your front door"). Explain what happened and what they should do in plain English.

Return a JSON object with the following structure:
{
  "posture": "Healthy" or "Warning" or "Critical",
  "summary": "A 2-3 sentence summary of the website's security status written for a beginner.",
  "top_threats": [
    { "name": "Simple Name for the Problem (e.g., 'Fake Data Entry')", "description": "A very simple, jargon-free explanation of what the attacker tried to do and why it matters.", "severity": "Low" or "Medium" or "High" or "Critical" }
  ],
  "recommendations": ["A clear, simple action step they can easily understand", "Another simple action step"]
}

Security Metrics:
Total Requests: ${stats.total || 0}
Total Threats Blocked: ${stats.blocked || 0}
Average Risk Score: ${stats.avgRisk || 0}

Recent Threats Sample:
${JSON.stringify(recentThreats, null, 2)}`;

      console.log('[AIInsight] Sending request to Gemini...');
      const result = await model.generateContent(prompt);
      const response = result.response;
      
      if (!response) {
        throw new Error('No response received from Gemini API.');
      }
      if (response.promptFeedback?.blockReason) {
        throw new Error(`Request blocked by safety filters: ${response.promptFeedback.blockReason}`);
      }
      
      // Extract text - try multiple methods for compatibility
      let text = '';
      
      // Method 1: response.text()
      try {
        text = response.text();
      } catch (e) {
        console.warn('[AIInsight] response.text() failed:', e.message);
      }
      
      // Method 2: Extract from candidates
      if (!text || text.trim().length === 0) {
        try {
          const candidates = response.candidates || [];
          if (candidates.length > 0) {
            const parts = candidates[0].content?.parts || [];
            const textParts = parts.filter(p => p.text && !p.thought).map(p => p.text);
            if (textParts.length > 0) {
              text = textParts.join('');
            } else {
              const allParts = parts.filter(p => p.text).map(p => p.text);
              if (allParts.length > 0) text = allParts[allParts.length - 1];
            }
          }
        } catch (e) {
          console.warn('[AIInsight] Candidate extraction failed:', e.message);
        }
      }

      text = (text || '').trim();
      console.log('[AIInsight] Raw response text:', text.substring(0, 300));

      if (!text) {
        throw new Error('Gemini returned an empty response. Please try again.');
      }

      // Clean markdown fences
      text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      
      // Extract JSON object
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        text = jsonMatch[0];
      }
      
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        console.error('[AIInsight] JSON parse failed. Text:', text);
        throw new Error('AI returned invalid data format. Please try again.');
      }
      
      // Ensure arrays exist
      parsed.top_threats = Array.isArray(parsed.top_threats) ? parsed.top_threats : [];
      parsed.recommendations = Array.isArray(parsed.recommendations) ? parsed.recommendations : [];
      
      console.log('[AIInsight] Report parsed successfully:', JSON.stringify(parsed).substring(0, 200));
      
      // Store in ref first (survives re-renders), then update state
      reportRef.current = parsed;
      
      if (mountedRef.current) {
        setReport(parsed);
        setLoading(false);
      }
      return; // Skip the finally setLoading since we did it here
    } catch (err) {
      console.error('[AIInsight] Error:', err);
      if (mountedRef.current) {
        setError(err.message || 'Failed to generate report.');
        setLoading(false);
      }
      return;
    }
  }, [events, stats]);

  // Use the ref value as fallback if state got cleared
  const displayReport = report || reportRef.current;

  const latestAiEvent = events.find(e => e.details?.ai_explanation);

  const getPostureColor = (posture) => {
    if (posture === 'Healthy') return '#10b981';
    if (posture === 'Warning') return '#f59e0b';
    if (posture === 'Critical') return '#ef4444';
    return '#8a8fa8';
  };

  const getPostureIcon = (posture) => {
    if (posture === 'Healthy') return <CheckCircle size={28} color="#10b981" />;
    if (posture === 'Warning') return <AlertTriangle size={28} color="#f59e0b" />;
    if (posture === 'Critical') return <ShieldAlert size={28} color="#ef4444" />;
    return <Brain size={28} />;
  };

  const getSeverityColor = (severity) => {
    if (severity === 'Critical') return '#ef4444';
    if (severity === 'High') return '#f59e0b';
    if (severity === 'Medium') return '#dba74a';
    return '#00d4ff';
  };

  return (
    <div>
      {/* AI Insight Engine Header Card */}
      <div className="card" style={{ padding: '32px', marginBottom: '24px', position: 'relative', border: '1px solid rgba(139, 92, 246, 0.4)', boxShadow: '0 0 40px rgba(139, 92, 246, 0.1)' }}>
        <div style={{
          position: 'absolute', top: -100, right: -100, width: 300, height: 300,
          background: 'rgba(139, 92, 246, 0.1)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none'
        }}></div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px', background: 'linear-gradient(135deg, #00d4ff 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2rem' }}>
              <Brain size={32} color="#8b5cf6" />
              AI Insight Engine
            </h2>
            <p style={{ margin: 0, color: '#8a8fa8' }}>
            </p>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={generateReport} 
            disabled={loading}
            style={{ padding: '12px 24px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(139, 92, 246, 0.5)', flexShrink: 0 }}
          >
            {loading ? <span className="pulse">Analysing Data...</span> : <><Sparkles size={18} /> Generate Full Report</>}
          </button>
        </div>

        {error && (
          <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', marginBottom: '24px' }}>
            ⚠️ Error: {error}
          </div>
        )}

        {!displayReport && !loading && !error && (
          <div style={{ textAlign: 'center', padding: '64px 0', color: '#8a8fa8', border: '1px dashed rgba(255, 255, 255, 0.06)', borderRadius: '12px' }}>
            <Sparkles size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
            <p>Click "Generate Full Report" to analyze the latest threat vectors.</p>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '64px 0', color: '#8a8fa8' }}>
            <div className="pulse" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <Brain size={48} color="#8b5cf6" />
              <p>Analyzing security data with AI...</p>
            </div>
          </div>
        )}
      </div>

      {/* Report Results - Rendered OUTSIDE the card to avoid overflow:hidden issues */}
      {displayReport && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '24px' }}>
          {/* Posture Summary */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              {getPostureIcon(displayReport.posture)}
              <h3 style={{ margin: 0, fontSize: '1.4rem', color: getPostureColor(displayReport.posture) }}>
                System Posture: {displayReport.posture}
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '1.05rem', lineHeight: '1.6', color: '#e8eaf0' }}>
              {displayReport.summary}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Top Threats */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={20} /> Top Active Threats
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {displayReport.top_threats.map((threat, i) => (
                  <div key={i} style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: `3px solid ${getSeverityColor(threat.severity)}` }}>
                    <strong style={{ display: 'block', marginBottom: '4px', color: '#e8eaf0' }}>
                      {threat.name || 'Unknown Threat'}{' '}
                      <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>({threat.severity || 'Medium'})</span>
                    </strong>
                    <span style={{ fontSize: '0.9rem', color: '#8a8fa8' }}>
                      {threat.description || 'No description provided.'}
                    </span>
                  </div>
                ))}
                {displayReport.top_threats.length === 0 && (
                  <span style={{ color: '#8a8fa8' }}>No significant threats detected.</span>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={20} /> Smart Recommendations
              </h3>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#e8eaf0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {displayReport.recommendations.map((rec, i) => (
                  <li key={i} style={{ lineHeight: '1.5' }}>{rec}</li>
                ))}
                {displayReport.recommendations.length === 0 && (
                  <li style={{ color: '#8a8fa8', listStyle: 'none', marginLeft: '-20px' }}>No recommendations at this time.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Latest Individual Threat Analysis */}
      <h3 style={{ marginTop: '32px', marginBottom: '16px' }}>Latest Individual Threat Analysis</h3>
      {latestAiEvent ? (
        <AIExplanationPanel explanation={latestAiEvent.details.ai_explanation} />
      ) : (
        <div className="card" style={{ padding: '24px', textAlign: 'center', color: '#8a8fa8' }}>
          No individual threat explanations available yet. Send some malicious traffic to trigger one!
        </div>
      )}
    </div>
  );
};

export default AIInsightTab;
