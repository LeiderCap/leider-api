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

async function sendNotificationEmail(
  payload: z.infer<typeof BlueprintSchema>,
  companyName: string
) {
  const apiKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.BLUEPRINT_NOTIFY_EMAIL || 'sleider@gmail.com';

  if (!apiKey) {
    console.log('RESEND_API_KEY not set — skipping email notification.');
    return;
  }

  const resend = new Resend(apiKey);
  const submitted = new Date().toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    dateStyle: 'full',
    timeStyle: 'short',
  });
  const isGovInquiry = payload.company_id === 'government-inquiry';
  const link = isGovInquiry
    ? 'https://leider-api.vercel.app/governments'
    : `https://leider-api.vercel.app/lens/${payload.company_id}`;

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
    isGovInquiry ? `Government Solutions Page: ${link}` : `View Lens Card™: ${link}`,
  ].join('\n');

  const { error } = await resend.emails.send({
    from: 'The Lens™ <onboarding@resend.dev>',
    to: notifyEmail,
    subject: `New Blueprint™ Request — ${companyName}`,
    text,
  });

  if (error) {
    console.error('Resend email failed:', error);
  } else {
    console.log(`Blueprint™ notification email sent to ${notifyEmail} for: ${companyName}`);
  }
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    console.log('[blueprint] incoming payload:', JSON.stringify(rawBody));

    const payload = BlueprintSchema.parse(rawBody);
    const supabase = getSupabaseClient();

    // Use company_name from payload if provided (government inquiries pass org name),
    // otherwise fall back to company_id as display name.
    let companyName: string = (rawBody.company_name as string) || payload.company_id;

    if (supabase) {
      // For known company IDs (not government inquiries), look up the name in Supabase
      if (payload.company_id !== 'government-inquiry') {
        const { data: company } = await supabase
          .from('companies')
          .select('name')
          .eq('id', payload.company_id)
          .maybeSingle();
        if (company?.name) companyName = company.name;
      }

      // Insert into enterprise_inquiries.
      // For government inquiries, company_id is set to NULL to avoid FK violation.
      const insertData: Record<string, unknown> = {
        name: payload.name || null,
        email: payload.email,
        organization: payload.organization || null,
        message: payload.message || null,
        status: 'new',
      };

      if (payload.company_id !== 'government-inquiry') {
        insertData.company_id = payload.company_id;
      }

      const { error } = await supabase.from('enterprise_inquiries').insert(insertData);

      if (error) {
        console.error('[blueprint] Supabase insert error:', error);
        throw error;
      }
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
        entity_id: payload.company_id !== 'government-inquiry' ? payload.company_id : null,
        event_data: {
          company: companyName,
          organization: payload.organization || null,
          timestamp: new Date().toISOString(),
        },
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
