import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isConfigured, testConnection } from '../lib/supabase';

// Demo data for when Supabase is not configured
function generateDemoData() {
  const now = Date.now();
  const events = [];
  const types = ['request', 'request', 'request', 'request', 'threat', 'blocked', 'rate_limit', 'file_scan'];
  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'GET', 'GET', 'POST', 'GET'];
  const paths = ['/', '/api/data', '/api/login', '/api/upload', '/api/status', '/api/admin', '/api/users', '/.env'];
  const ips = ['192.168.1.45', '10.0.0.12', '172.16.0.88', '203.0.113.50', '198.51.100.22', '192.168.1.100', '10.0.0.55', '203.0.113.99'];
  const threatTypes = ['xss', 'nosql_injection', 'brute_force', 'rate_limit_exceeded', 'suspicious_access', 'file_violation', null, null];
  const severities = ['critical', 'high', 'medium', 'low', 'high', 'medium', null, null];
  const actions = ['allow', 'allow', 'block', 'alert', 'block', 'allow', 'monitor', 'allow'];

  for (let i = 0; i < 200; i++) {
    const typeIdx = Math.floor(Math.random() * types.length);
    const isRequest = types[typeIdx] === 'request';
    events.push({
      id: `demo-${i}`,
      api_key: 'demo',
      event_type: types[typeIdx],
      ip: ips[Math.floor(Math.random() * ips.length)],
      method: methods[Math.floor(Math.random() * methods.length)],
      path: paths[Math.floor(Math.random() * paths.length)],
      status_code: isRequest ? (Math.random() > 0.1 ? 200 : 403) : null,
      risk_score: isRequest
        ? Math.floor(Math.random() * 30)
        : Math.floor(Math.random() * 100),
      threat_type: isRequest ? null : threatTypes[Math.floor(Math.random() * threatTypes.length)],
      severity: isRequest ? null : severities[Math.floor(Math.random() * severities.length)],
      action: actions[Math.floor(Math.random() * actions.length)],
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      response_time_ms: parseFloat((Math.random() * 50 + 0.5).toFixed(2)),
      details: null,
      created_at: new Date(now - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  return events.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

/**
 * Custom hook that fetches security events from Supabase,
 * computes aggregated stats, and subscribes to real-time inserts.
 * Falls back to demo data when Supabase is not configured.
 */
export function useSecurityData(apiKey, timeRange = '24h') {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null); // 'connected', 'error', 'demo'
  const channelRef = useRef(null);
  const connectionTestedRef = useRef(false);

  const getTimeFilter = useCallback(() => {
    const now = new Date();
    const map = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };
    return new Date(now.getTime() - (map[timeRange] || map['24h'])).toISOString();
  }, [timeRange]);

  // Test connection on first load
  useEffect(() => {
    if (connectionTestedRef.current || !apiKey) return;
    connectionTestedRef.current = true;

    if (!isConfigured) {
      setConnectionStatus('demo');
      console.log('[SecureFlow] Running in demo mode');
      return;
    }

    testConnection().then((result) => {
      if (result.ok) {
        setConnectionStatus('connected');
        console.log('[SecureFlow] ✅ Supabase connected — table exists');
      } else {
        setConnectionStatus('error');
        setError(result.error);
        console.error('[SecureFlow] ❌ Supabase connection issue:', result.error);
      }
    });
  }, [apiKey]);

  const fetchEvents = useCallback(async () => {
    if (!apiKey) {
      setEvents([]);
      setLoading(false);
      return;
    }

    // Use demo data if Supabase is not configured
    if (!isConfigured) {
      setLoading(true);
      // Simulate network delay
      await new Promise((r) => setTimeout(r, 600));
      setEvents(generateDemoData());
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const since = getTimeFilter();
      const { data, error: fetchError } = await supabase
        .from('security_events')
        .select('*')
        .eq('api_key', apiKey)
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(2000);

      if (fetchError) {
        // Provide human-readable error messages
        let errorMsg = fetchError.message;
        if (fetchError.message?.includes('relation') || fetchError.code === '42P01') {
          errorMsg = 'Table "security_events" not found. Please run the SQL schema in the Supabase SQL Editor.';
        } else if (fetchError.code === 'PGRST301' || fetchError.message?.includes('JWT')) {
          errorMsg = 'Authentication failed. Check your Supabase publishable key.';
        }
        throw new Error(errorMsg);
      }

      setEvents(data || []);
      setConnectionStatus('connected');

      if (data && data.length === 0) {
        console.log(`[SecureFlow] No events found for API key "${apiKey}" in range ${timeRange}. Start your Express server to generate events.`);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiKey, getTimeFilter]);

  // Initial fetch + refetch on timeRange change
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Real-time subscription (only when Supabase is configured)
  useEffect(() => {
    if (!apiKey || !isConfigured || !supabase) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`security-events-${apiKey}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_events',
          filter: `api_key=eq.${apiKey}`,
        },
        (payload) => {
          console.log('[SecureFlow] 📡 Real-time event received:', payload.new?.event_type);
          setEvents((prev) => [payload.new, ...prev].slice(0, 2000));
        }
      )
      .subscribe((status) => {
        console.log('[SecureFlow] Realtime subscription status:', status);
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [apiKey]);

  // ── Computed statistics ──────────────────────────────────────

  const stats = computeStats(events);
  const trafficData = computeTrafficTimeline(events, timeRange);
  const threatData = computeThreatBreakdown(events);
  const severityData = computeSeverityBreakdown(events);
  const topIPs = computeTopIPs(events);
  const recentThreats = events
    .filter((e) => e.event_type === 'threat' || e.event_type === 'blocked')
    .slice(0, 50);

  return {
    events,
    stats,
    trafficData,
    threatData,
    severityData,
    topIPs,
    recentThreats,
    loading,
    error,
    refetch: fetchEvents,
    isDemo: !isConfigured,
    connectionStatus,
  };
}

// ── Stat computation helpers ─────────────────────────────────────

function computeStats(events) {
  const total = events.length;
  const requests = events.filter((e) => e.event_type === 'request').length;
  const threats = events.filter((e) => e.event_type === 'threat').length;
  const blocked = events.filter(
    (e) => e.event_type === 'blocked' || e.action === 'block'
  ).length;
  const rateLimited = events.filter((e) => e.event_type === 'rate_limit').length;
  const fileScan = events.filter((e) => e.event_type === 'file_scan').length;
  const ipBans = events.filter((e) => e.event_type === 'ip_ban').length;

  const riskScores = events
    .filter((e) => typeof e.risk_score === 'number' && e.risk_score > 0)
    .map((e) => e.risk_score);
  const avgRisk = riskScores.length
    ? Math.round(riskScores.reduce((a, b) => a + b, 0) / riskScores.length)
    : 0;

  const responseTimes = events
    .filter((e) => typeof e.response_time_ms === 'number')
    .map((e) => e.response_time_ms);
  const avgResponseTime = responseTimes.length
    ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(1)
    : '0';

  return {
    total,
    requests,
    threats,
    blocked,
    rateLimited,
    fileScan,
    ipBans,
    avgRisk,
    avgResponseTime,
  };
}

function computeTrafficTimeline(events, timeRange) {
  if (events.length === 0) return [];

  const bucketMs = {
    '1h': 5 * 60 * 1000,
    '6h': 15 * 60 * 1000,
    '24h': 60 * 60 * 1000,
    '7d': 6 * 60 * 60 * 1000,
    '30d': 24 * 60 * 60 * 1000,
  }[timeRange] || 60 * 60 * 1000;

  const buckets = {};

  events.forEach((event) => {
    const ts = new Date(event.created_at).getTime();
    const bucketKey = Math.floor(ts / bucketMs) * bucketMs;

    if (!buckets[bucketKey]) {
      buckets[bucketKey] = { time: bucketKey, requests: 0, threats: 0, blocked: 0 };
    }

    if (event.event_type === 'request') buckets[bucketKey].requests++;
    if (event.event_type === 'threat') buckets[bucketKey].threats++;
    if (event.event_type === 'blocked' || event.action === 'block') buckets[bucketKey].blocked++;
  });

  return Object.values(buckets).sort((a, b) => a.time - b.time);
}

function computeThreatBreakdown(events) {
  const threatEvents = events.filter(
    (e) => e.threat_type && (e.event_type === 'threat' || e.event_type === 'blocked')
  );
  const counts = {};
  threatEvents.forEach((e) => {
    const type = e.threat_type || 'unknown';
    counts[type] = (counts[type] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function computeSeverityBreakdown(events) {
  const severityCounts = { none: 0, low: 0, medium: 0, high: 0, critical: 0 };
  events.forEach((e) => {
    if (e.severity && severityCounts[e.severity] !== undefined) {
      severityCounts[e.severity]++;
    }
  });
  return Object.entries(severityCounts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));
}

function computeTopIPs(events) {
  const ips = {};
  events
    .filter((e) => e.ip && (e.event_type === 'threat' || e.event_type === 'blocked'))
    .forEach((e) => {
      if (!ips[e.ip]) ips[e.ip] = { ip: e.ip, count: 0, maxRisk: 0 };
      ips[e.ip].count++;
      ips[e.ip].maxRisk = Math.max(ips[e.ip].maxRisk, e.risk_score || 0);
    });
  return Object.values(ips)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}
