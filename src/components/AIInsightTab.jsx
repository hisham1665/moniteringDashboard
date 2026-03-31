import React, { useState, useRef, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Sparkles, Brain, ShieldAlert, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import AIExplanationPanel from './AIExplanationPanel';

const AIInsightTab = ({ events, stats }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const reportRef = useRef(null);
  const mountedRef = useRef(true);

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
      
      let text = '';
      
      try {
        text = response.text();
      } catch (e) {
        console.warn('[AIInsight] response.text() failed:', e.message);
      }
      
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

      text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      
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
      
      parsed.top_threats = Array.isArray(parsed.top_threats) ? parsed.top_threats : [];
      parsed.recommendations = Array.isArray(parsed.recommendations) ? parsed.recommendations : [];
      
      console.log('[AIInsight] Report parsed successfully:', JSON.stringify(parsed).substring(0, 200));
      
      reportRef.current = parsed;
      
      if (mountedRef.current) {
        setReport(parsed);
        setLoading(false);
      }
      return;
    } catch (err) {
      console.error('[AIInsight] Error:', err);
      if (mountedRef.current) {
        setError(err.message || 'Failed to generate report.');
        setLoading(false);
      }
      return;
    }
  }, [events, stats]);

  const displayReport = report || reportRef.current;

  const latestAiEvent = events.find(e => e.details?.ai_explanation);

  const getPostureColor = (posture) => {
    if (posture === 'Healthy') return '#22c55e';
    if (posture === 'Warning') return '#eab308';
    if (posture === 'Critical') return '#ef4444';
    return '#a1a1aa';
  };

  const getPostureIcon = (posture) => {
    if (posture === 'Healthy') return <CheckCircle size={28} color="#22c55e" />;
    if (posture === 'Warning') return <AlertTriangle size={28} color="#eab308" />;
    if (posture === 'Critical') return <ShieldAlert size={28} color="#ef4444" />;
    return <Brain size={28} />;
  };

  const getSeverityColor = (severity) => {
    if (severity === 'Critical') return '#ef4444';
    if (severity === 'High') return '#ef4444';
    if (severity === 'Medium') return '#eab308';
    return '#4ade80';
  };

  return (
    <div>
      {/* AI Insight Engine Header Card */}
      <div className="card card-ai-glow" style={{ 
        padding: '36px', 
        marginBottom: '24px', 
        position: 'relative', 
        border: '1px solid rgba(168, 85, 247, 0.2)', 
        overflow: 'hidden' 
      }}>
        {/* Background gradient orb */}
        <div style={{
          position: 'absolute', top: -80, right: -80, width: 280, height: 280,
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 70%)', 
          pointerEvents: 'none'
        }}></div>
        <div style={{
          position: 'absolute', bottom: -60, left: -60, width: 200, height: 200,
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%)', 
          pointerEvents: 'none'
        }}></div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', position: 'relative' }}>
          <div>
            <h2 style={{ 
              margin: '0 0 6px 0', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              background: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent', 
              fontSize: '1.8rem',
              fontWeight: 800,
              letterSpacing: '-0.5px'
            }}>
              <Brain size={30} color="#a855f7" />
              AI Insight Engine
            </h2>
            <p style={{ margin: 0, color: '#52525b', fontSize: '0.85rem' }}>
              Powered by Gemini — Analyze your security posture with AI
            </p>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={generateReport} 
            disabled={loading}
            style={{ 
              padding: '12px 28px', 
              fontSize: '0.95rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
              boxShadow: '0 4px 20px rgba(168, 85, 247, 0.3)',
              flexShrink: 0,
              fontWeight: 600
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="pulse" />
                Analysing...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Report
              </>
            )}
          </button>
        </div>

        {error && (
          <div style={{ 
            padding: '14px 18px', 
            background: 'rgba(239, 68, 68, 0.08)', 
            border: '1px solid rgba(239, 68, 68, 0.2)', 
            borderRadius: '10px', 
            color: '#ef4444', 
            marginBottom: '24px',
            fontSize: '0.88rem'
          }}>
            ⚠️ {error}
          </div>
        )}

        {!displayReport && !loading && !error && (
          <div style={{ 
            textAlign: 'center', 
            padding: '56px 0', 
            color: '#52525b', 
            border: '1px dashed rgba(255, 255, 255, 0.06)', 
            borderRadius: '12px',
            background: 'rgba(0,0,0,0.15)',
            position: 'relative'
          }}>
            <Sparkles size={44} style={{ opacity: 0.2, marginBottom: '16px' }} />
            <p style={{ fontSize: '0.9rem' }}>Click <strong style={{ color: '#a855f7' }}>"Generate Report"</strong> to analyze the latest threat vectors.</p>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '56px 0', color: '#a1a1aa' }}>
            <div className="pulse" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <Brain size={48} color="#a855f7" />
              <p>Analyzing security data with AI...</p>
              <div style={{ 
                width: 200, 
                height: 3, 
                background: 'rgba(255,255,255,0.06)', 
                borderRadius: 999, 
                overflow: 'hidden',
                marginTop: 8
              }}>
                <div style={{ 
                  width: '60%', 
                  height: '100%', 
                  background: 'linear-gradient(90deg, #3b82f6, #a855f7)',
                  borderRadius: 999,
                  animation: 'shimmer 1.5s ease-in-out infinite'
                }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Report Results */}
      {displayReport && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
          {/* Posture Summary */}
          <div className="card fade-in" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
              {getPostureIcon(displayReport.posture)}
              <h3 style={{ 
                margin: 0, 
                fontSize: '1.3rem', 
                color: getPostureColor(displayReport.posture),
                fontWeight: 700,
                letterSpacing: '-0.3px'
              }}>
                System Posture: {displayReport.posture}
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '1rem', lineHeight: '1.7', color: '#f4f4f5' }}>
              {displayReport.summary}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Top Threats */}
            <div className="card fade-in fade-in-delay-1" style={{ padding: '24px' }}>
              <h3 style={{ 
                margin: '0 0 16px 0', 
                color: '#ef4444', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                fontSize: '1rem',
                fontWeight: 700
              }}>
                <ShieldAlert size={20} /> Top Active Threats
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {displayReport.top_threats.map((threat, i) => (
                  <div key={i} style={{ 
                    padding: '14px 16px', 
                    background: 'rgba(0,0,0,0.2)', 
                    borderRadius: '10px', 
                    borderLeft: `3px solid ${getSeverityColor(threat.severity)}`,
                    transition: 'background 200ms ease'
                  }}>
                    <strong style={{ display: 'block', marginBottom: '4px', color: '#fafafa', fontSize: '0.9rem' }}>
                      {threat.name || 'Unknown Threat'}{' '}
                      <span style={{ 
                        fontSize: '0.73rem', 
                        padding: '2px 8px',
                        borderRadius: 999,
                        background: `${getSeverityColor(threat.severity)}15`,
                        color: getSeverityColor(threat.severity),
                        fontWeight: 600,
                        marginLeft: 4
                      }}>
                        {threat.severity || 'Medium'}
                      </span>
                    </strong>
                    <span style={{ fontSize: '0.85rem', color: '#a1a1aa', lineHeight: '1.5' }}>
                      {threat.description || 'No description provided.'}
                    </span>
                  </div>
                ))}
                {displayReport.top_threats.length === 0 && (
                  <span style={{ color: '#52525b', fontSize: '0.88rem' }}>No significant threats detected.</span>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div className="card fade-in fade-in-delay-2" style={{ padding: '24px' }}>
              <h3 style={{ 
                margin: '0 0 16px 0', 
                color: '#3b82f6', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                fontSize: '1rem',
                fontWeight: 700
              }}>
                <CheckCircle size={20} /> Smart Recommendations
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {displayReport.recommendations.map((rec, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px 14px',
                    background: 'rgba(59, 130, 246, 0.04)',
                    borderRadius: '10px',
                    border: '1px solid rgba(59, 130, 246, 0.06)',
                  }}>
                    <span style={{ 
                      width: 22, height: 22, 
                      minWidth: 22,
                      borderRadius: '50%', 
                      background: 'rgba(59, 130, 246, 0.1)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#3b82f6',
                      marginTop: 2
                    }}>
                      {i + 1}
                    </span>
                    <span style={{ color: '#f4f4f5', lineHeight: '1.5', fontSize: '0.88rem' }}>{rec}</span>
                  </div>
                ))}
                {displayReport.recommendations.length === 0 && (
                  <span style={{ color: '#52525b', fontSize: '0.88rem' }}>No recommendations at this time.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Latest Individual Threat Analysis */}
      <h3 style={{ marginTop: '32px', marginBottom: '16px', color: '#fafafa', fontWeight: 700 }}>
        Latest Individual Threat Analysis
      </h3>
      {latestAiEvent ? (
        <AIExplanationPanel explanation={latestAiEvent.details.ai_explanation} />
      ) : (
        <div className="card" style={{ padding: '28px', textAlign: 'center', color: '#52525b', fontSize: '0.88rem' }}>
          No individual threat explanations available yet. Send some malicious traffic to trigger one!
        </div>
      )}
    </div>
  );
};

export default AIInsightTab;
