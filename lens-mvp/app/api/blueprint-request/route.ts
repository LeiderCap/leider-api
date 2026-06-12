import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, company, notes } = body;

    if (!email?.trim()) {
      return NextResponse.json({ error: 'email is required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase
      .from('enterprise_inquiries')
      .insert({
        name: name?.trim() || null,
        email: email.trim(),
        company: company?.trim() || null,
        request_type: 'full_transformation_blueprint',
        notes: notes?.trim() || null,
      });

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Unexpected error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
