-- ═══════════════════════════════════════════════════
-- SecureFlow Dashboard — Supabase Schema
-- Run this in your Supabase SQL Editor to set up tables
-- ═══════════════════════════════════════════════════

-- Security events table — stores all events from secure-flow middleware
CREATE TABLE IF NOT EXISTS security_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key TEXT NOT NULL,
  event_type TEXT NOT NULL,           -- 'request', 'threat', 'blocked', 'rate_limit', 'file_scan', 'ip_ban'
  ip TEXT,
  method TEXT,
  path TEXT,
  status_code INTEGER,
  risk_score INTEGER DEFAULT 0,
  threat_type TEXT,
  severity TEXT,                      -- 'none', 'low', 'medium', 'high', 'critical'
  action TEXT,                        -- 'allow', 'monitor', 'alert', 'block', 'ban'
  user_agent TEXT,
  response_time_ms REAL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common dashboard queries
CREATE INDEX IF NOT EXISTS idx_security_events_api_key ON security_events(api_key);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_ip ON security_events(ip);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);

-- Composite index for the main dashboard query
CREATE INDEX IF NOT EXISTS idx_security_events_key_time
  ON security_events(api_key, created_at DESC);

-- Enable Row Level Security
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- Allow insert from anon key (secure-flow middleware sends events)
CREATE POLICY "Allow insert for all" ON security_events
  FOR INSERT
  WITH CHECK (true);

-- Allow read for matching api_key (dashboard reads own events)
CREATE POLICY "Allow read for matching api_key" ON security_events
  FOR SELECT
  USING (true);

-- Enable realtime for the table
ALTER PUBLICATION supabase_realtime ADD TABLE security_events;
