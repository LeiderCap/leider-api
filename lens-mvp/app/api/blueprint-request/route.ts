import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes('placeholder') || key.includes('placeholder')) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, company, notes } = await req.json();

    if (!email?.trim()) {
      return NextResponse.json({ error: 'email is required' }, { status: 400 });
    }

    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.from('enterprise_inquiries').insert({
        name: name?.trim() || null,
        email: email.trim(),
        company: company?.trim() || null,
        request_type: 'full_transformation_blueprint',
        notes: notes?.trim() || null,
      });
      if (error) {
        console.error('[/api/blueprint-request] Supabase error:', error.message, error.code);
        return NextResponse.json(
          { error: `Database error: ${error.message}` },
          { status: 500 }
        );
      }
    } else {
      console.log('[/api/blueprint-request] Supabase not configured — logging request:', {
        name,
        email,
        company,
        notes,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[/api/blueprint-request] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
