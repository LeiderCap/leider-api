import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, company, target_company, layers_selected, message } = body;

    if (!email?.trim()) {
      return NextResponse.json({ error: 'email is required' }, { status: 400 });
    }
    if (!name?.trim()) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }
    if (!company?.trim()) {
      return NextResponse.json({ error: 'company is required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase
      .from('pe_stack_inquiries')
      .insert({
        name: name.trim(),
        email: email.trim(),
        company: company.trim(),
        target_company: target_company?.trim() || null,
        layers_selected: Array.isArray(layers_selected) ? layers_selected : [],
        message: message?.trim() || null,
        submitted_at: new Date().toISOString(),
      });

    if (error) {
      console.error('pe_stack_inquiries insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Unexpected error in pe-stack-request:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
