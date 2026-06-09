import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured() {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your_') &&
    !supabaseAnonKey.includes('your_')
  );
}

export function getSupabaseClient() {
  if (!isSupabaseConfigured()) return null;
  return createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: { persistSession: false }
  });
}
