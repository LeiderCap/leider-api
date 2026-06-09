import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase';

const BlueprintSchema = z.object({
  company_id: z.string().min(1),
  name: z.string().min(1).optional().or(z.literal('')),
  email: z.string().email(),
  organization: z.string().optional().or(z.literal('')),
  message: z.string().optional().or(z.literal(''))
});

export async function POST(request: Request) {
  try {
    const payload = BlueprintSchema.parse(await request.json());
    const supabase = getSupabaseClient();

    if (supabase) {
      const { error } = await supabase.from('enterprise_inquiries').insert({
        company_id: payload.company_id,
        name: payload.name || null,
        email: payload.email,
        organization: payload.organization || null,
        message: payload.message || null,
        status: 'new'
      });

      if (error) throw error;
    } else {
      console.log('Blueprint inquiry received without Supabase configured:', payload);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Blueprint inquiry failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Blueprint inquiry failed.' },
      { status: 400 }
    );
  }
}
