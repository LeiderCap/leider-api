import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ paid: false, error: 'session_id required' }, { status: 400 });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.status === 'complete' || session.payment_status === 'paid';
    return NextResponse.json({
      paid,
      tier: session.metadata?.tier ?? 'single',
      company: session.metadata?.company ?? '',
      ticker: session.metadata?.ticker ?? '',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[stripe/verify-session] error:', message);
    return NextResponse.json({ paid: false, error: message }, { status: 500 });
  }
}
