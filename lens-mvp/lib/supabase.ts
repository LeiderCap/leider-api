import { createClient } from '@supabase/supabase-js';

function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || url.includes('your_') || url.includes('placeholder')) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured.');
  }
  return url;
}

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    key &&
    !url.includes('your_') &&
    !url.includes('placeholder') &&
    !key.includes('your_') &&
    !key.includes('placeholder')
  );
}

/**
 * Public/anon client for intentionally public operations.
 * RLS must remain the authorization boundary for this client.
 */
export function getPublicSupabaseClient() {
  const url = getSupabaseUrl();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key || key.includes('your_') || key.includes('placeholder')) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured.');
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

/**
 * Backward-compatible alias for public/anon operations.
 * New code should call getPublicSupabaseClient explicitly.
 */
export function getSupabaseClient() {
  return getPublicSupabaseClient();
}

/**
 * Server-side Supabase client using the service-role key.
 * This intentionally fails closed when the service key is absent; it must
 * never silently downgrade privileged work to the public anon role.
 */
export function getServiceSupabaseClient() {
  const url = getSupabaseUrl();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || serviceKey.includes('your_') || serviceKey.includes('placeholder')) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for this server operation.');
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
