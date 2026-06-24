import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, company, role, pilot_count, message } = body;

    if (!name || !email || !company) {
      return NextResponse.json({ error: 'name, email, and company are required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('transformation_factory_waitlist')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        company: company.trim(),
        role: role?.trim() ?? null,
        pilot_count: pilot_count?.trim() ?? null,
        message: message?.trim() ?? null,
        submitted_at: new Date().toISOString(),
      });

    if (error) {
      console.error('[transformation-factory-waitlist] Supabase error:', error);
      return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[transformation-factory-waitlist] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
