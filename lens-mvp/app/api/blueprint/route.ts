import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase';
import { Resend } from 'resend';

const BlueprintSchema = z.object({
  company_id: z.string().min(1),
  name: z.string().min(1).optional().or(z.literal('')),
  email: z.string().email(),
  organization: z.string().optional().or(z.literal('')),
  message: z.string().optional().or(z.literal(''))
});

async function sendNotificationEmail(payload: z.infer<typeof BlueprintSchema>, companyName: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.BLUEPRINT_NOTIFY_EMAIL;

  if (!apiKey || !notifyEmail) {
    console.log('Resend not configured — skipping email notification.');
    return;
  }

  const resend = new Resend(apiKey);
  const submitted = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles', dateStyle: 'full', timeStyle: 'short' });
  const link = `https://leider-api.vercel.app/lens/${payload.company_id}`;

  const text = [
    `New Blueprint™ Request`,
    ``,
    `Company:      ${companyName}`,
    `Name:         ${payload.name || '(not provided)'}`,
    `Email:        ${payload.email}`,
    `Organization: ${payload.organization || '(not provided)'}`,
    `Message:      ${payload.message || '(not provided)'}`,
    `Submitted:    ${submitted} PT`,
    ``,
    `View Lens Card™: ${link}`,
  ].join('\n');

  const { error } = await resend.emails.send({
    from: 'The Lens™ <onboarding@resend.dev>',
    to: notifyEmail,
    subject: `New Blueprint™ Request — ${companyName}`,
    text,
  });

  if (error) {
    console.error('Resend email failed:', error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = BlueprintSchema.parse(await request.json());
    const supabase = getSupabaseClient();

    let companyName = payload.company_id;

    if (supabase) {
      // Fetch company name for the notification email
      const { data: company } = await supabase
        .from('companies')
        .select('name')
        .eq('id', payload.company_id)
        .maybeSingle();

      if (company?.name) companyName = company.name;

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

    // Send notification email — best-effort, never fails the request
    sendNotificationEmail(payload, companyName).catch((err) => {
      console.error('Unexpected error in sendNotificationEmail:', err);
    });

    // TCP™ — Transformation Intent Event™ (Blueprint™ request)
    // Future: DVI™ — Decision Visibility Infrastructure™ (Phase 2)
    if (supabase) {
      void supabase.from('transformation_events').insert({
        event_type: 'blueprint_request',
        entity_id: payload.company_id,
        event_data: {
          company: companyName,
          organization: payload.organization || null,
          timestamp: new Date().toISOString()
        }
      }).then(undefined, () => { /* non-fatal */ });
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
