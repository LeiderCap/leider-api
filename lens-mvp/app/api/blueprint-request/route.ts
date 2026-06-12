import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[blueprint-request] Incoming payload:', JSON.stringify(body));

    const { name, email, company, notes } = body as {
      name?: string;
      email?: string;
      company?: string;
      notes?: string;
    };

    if (!email?.trim()) {
      return NextResponse.json({ error: 'email is required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    console.log('[blueprint-request] Supabase client:', supabase ? 'initialized' : 'NOT available');

    if (supabase) {
      const insertPayload = {
        name: name?.trim() || null,
        email: email.trim(),
        company: company?.trim() || null,
        request_type: 'full_transformation_blueprint',
        notes: notes?.trim() || null,
      };

      console.log('[blueprint-request] Insert payload:', JSON.stringify(insertPayload));

      const { data, error } = await supabase
        .from('enterprise_inquiries')
        .insert(insertPayload)
        .select();

      console.log('[blueprint-request] Insert result:', { data, error });

      if (error) {
        console.error('[blueprint-request] Supabase insert error:', {
          code: error.code,
          message: error.message,
          hint: error.hint,
          details: error.details,
        });
        // Return the actual error message so it shows in the browser network tab
        return NextResponse.json(
          { error: `Database error: ${error.message}` },
          { status: 500 }
        );
      }
    } else {
      console.log('[blueprint-request] Supabase not configured — request logged only:', {
        name,
        email,
        company,
        notes,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[blueprint-request] Unexpected error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
