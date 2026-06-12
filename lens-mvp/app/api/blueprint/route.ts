import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase';
import { Resend } from 'resend';

const BlueprintSchema = z.object({
  company_id: z.string().min(1),
  name: z.string().optional().or(z.literal('')),
  email: z.string().email(),
  organization: z.string().optional().or(z.literal('')),
  role: z.string().optional().or(z.literal('')),
  message: z.string().optional().or(z.literal('')),
  company_name: z.string().optional().or(z.literal('')),
});

async function sendNotificationEmail(
  payload: z.infer<typeof BlueprintSchema>,
  companyName: string
) {
  const apiKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.BLUEPRINT_NOTIFY_EMAIL || 'sleider@gmail.com';

  if (!apiKey) {
    console.log('[blueprint] RESEND_API_KEY not set — skipping email notification.');
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
    `New Blueprint™ / Assessment Request`,
    ``,
    `Company:      ${companyName}`,
    `Name:         ${payload.name || '(not provided)'}`,
    `Email:        ${payload.email}`,
    `Organization: ${payload.organization || '(not provided)'}`,
    `Role:         ${payload.role || '(not provided)'}`,
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
    console.error('[blueprint] Resend email failed:', error);
  } else {
    console.log(`[blueprint] Notification email sent to ${notifyEmail} for: ${companyName}`);
  }
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    console.log('[blueprint] Incoming payload:', JSON.stringify(rawBody));

    // Validate — email is required, everything else is optional
    const payload = BlueprintSchema.parse(rawBody);
    console.log('[blueprint] Zod validation passed');

    const supabase = getSupabaseClient();
    console.log('[blueprint] Supabase client:', supabase ? 'initialized' : 'NOT available');

    // Use company_name from payload if provided, otherwise fall back to company_id
    let companyName: string = payload.company_name || payload.company_id;

    if (supabase) {
      // For known company IDs (not special inquiry types), look up the name in Supabase
      const specialIds = ['government-inquiry', 'enterprise-inquiry', 'investor-inquiry', 'assessment-inquiry', 'individual-inquiry'];
      if (!specialIds.includes(payload.company_id)) {
        const { data: company } = await supabase
          .from('companies')
          .select('name')
          .eq('id', payload.company_id)
          .maybeSingle();
        if (company?.name) companyName = company.name;
      }

      // Build insert payload — map form fields to enterprise_inquiries columns
      // Organization → company, Role → role (new column), Message → notes
      const insertData: Record<string, unknown> = {
        name: payload.name || null,
        email: payload.email,
        company: payload.organization || companyName || null,
        role: payload.role || null,
        request_type: payload.company_id,
        notes: payload.message || null,
      };

      console.log('[blueprint] Insert payload:', JSON.stringify(insertData));

      const { data, error } = await supabase
        .from('enterprise_inquiries')
        .insert(insertData)
        .select();

      console.log('[blueprint] Insert result:', { data, error });

      if (error) {
        // Log the full error but do NOT throw — we still want to send the email
        // and return success so the user doesn't see a false failure
        console.error('[blueprint] Supabase insert error (non-fatal):', {
          code: error.code,
          message: error.message,
          hint: error.hint,
          details: error.details,
        });
      }
    } else {
      console.log('[blueprint] No Supabase — inquiry received:', payload);
    }

    // Send notification email — best-effort, never fails the request
    sendNotificationEmail(payload, companyName).catch((err) => {
      console.error('[blueprint] Unexpected error in sendNotificationEmail:', err);
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[blueprint] Route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Blueprint inquiry failed.' },
      { status: 400 }
    );
  }
}
