import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type Tier = 'single' | 'pro' | 'enterprise';

function getPriceId(tier: Tier): string {
  switch (tier) {
    case 'single':
      return process.env.STRIPE_PRICE_SINGLE ?? process.env.STRIPE_PRICE_ID ?? '';
    case 'pro':
      return process.env.STRIPE_PRICE_PRO ?? process.env.STRIPE_PRICE_ID ?? '';
    case 'enterprise':
      return process.env.STRIPE_PRICE_ENTERPRISE ?? process.env.STRIPE_PRICE_ID ?? '';
    default:
      return process.env.STRIPE_PRICE_ID ?? '';
  }
}

export async function POST(req: NextRequest) {
  try {
    const { company, ticker, reportId, tier = 'pro' } = await req.json() as {
      company?: string;
      ticker?: string;
      reportId?: string;
      tier?: Tier;
    };

    const priceId = getPriceId(tier);
    if (!priceId) {
      return NextResponse.json(
        { error: `Stripe price ID not configured for tier: ${tier}` },
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/lens/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/lens/cancel`,
      metadata: {
        company: company ?? '',
        ticker: ticker ?? '',
        reportId: reportId ?? '',
        tier,
        product: 'transformation_intelligence_report',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Stripe checkout error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
