import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body?.email ?? '').trim().toLowerCase();
    const feature = (body?.feature ?? 'stack-the-deck').trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase
        .from('waitlist')
        .insert({ email, feature });

      if (error && error.code !== '23505') {
        // 23505 = unique violation (already on list) — treat as success
        console.error('[waitlist] Supabase insert error:', error.message);
        return NextResponse.json({ error: 'Failed to save.' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[waitlist] Unexpected error:', err);
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 });
  }
}
