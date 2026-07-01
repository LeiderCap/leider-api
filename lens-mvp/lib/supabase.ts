import { createClient } from '@supabase/supabase-js';

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    key &&
    !url.includes('your_') &&
    !key.includes('your_')
  );
}

export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(`Supabase env vars missing: URL=${!!url} KEY=${!!key}`);
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

/**
 * Server-side Supabase client that uses the service role key.
 * Bypasses RLS — use only in server-side code (API routes, Server Components).
 * Falls back to the anon key if SERVICE_ROLE_KEY is not set.
 */
export function getServiceSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const key = serviceKey ?? anonKey;
  if (!url || !key) {
    throw new Error(`Supabase env vars missing: URL=${!!url} KEY=${!!key}`);
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
