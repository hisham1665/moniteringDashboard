import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = !!(
  supabaseUrl &&
  supabaseKey &&
  supabaseUrl !== 'your-supabase-url-here' &&
  supabaseKey !== 'your-supabase-anon-key-here' &&
  supabaseUrl.startsWith('https://')
);

if (!isConfigured) {
  console.warn(
    '[SecureFlow] Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in dashboard/.env'
  );
}

// Create client when configured
export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

/**
 * Test the Supabase connection by querying the security_events table.
 * Returns { ok: boolean, error?: string, tableExists?: boolean }
 */
export async function testConnection() {
  if (!supabase) {
    return { ok: false, error: 'Supabase client not configured' };
  }
  try {
    const { data, error } = await supabase
      .from('security_events')
      .select('id')
      .limit(1);

    if (error) {
      // If the table doesn't exist, PostgREST returns a 404-like error
      if (error.message?.includes('relation') || error.code === '42P01') {
        return {
          ok: false,
          error: 'Table "security_events" not found. Run the SQL schema in the Supabase dashboard.',
          tableExists: false,
        };
      }
      // Permission / auth errors
      if (error.code === '401' || error.message?.includes('JWT') || error.message?.includes('apikey')) {
        return {
          ok: false,
          error: 'Authentication failed. Check your VITE_SUPABASE_ANON_KEY in .env.',
        };
      }
      return { ok: false, error: error.message };
    }

    return { ok: true, tableExists: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
