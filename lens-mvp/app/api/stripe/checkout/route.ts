import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

type Tier = 'single' | 'pro' | 'enterprise';

// Live Stripe Price IDs — prefer env vars, fall back to hardcoded live IDs
const PRICE_FALLBACKS: Record<Tier, string> = {
  single:     'price_1TlNJJRDk2X11H6s6jzMTCfh',
  pro:        'price_1TlNJJRDk2X11H6sAJWwy6hI',
  enterprise: 'price_1TlNJIRDk2X11H6sZXP4XeMX',
};

/**
 * Returns a valid Stripe Price ID for the given tier.
 * Validates that the env var is a price_ ID (not a prod_ product ID).
 * Falls back to hardcoded live price IDs if env var is missing or invalid.
 */
function getPriceId(tier: Tier): string {
  const isValidPriceId = (id: string | undefined): id is string =>
    typeof id === 'string' && id.startsWith('price_');

  switch (tier) {
    case 'single': {
      const envVal = process.env.STRIPE_PRICE_SINGLE;
      return isValidPriceId(envVal) ? envVal : PRICE_FALLBACKS.single;
    }
    case 'pro': {
      const envVal = process.env.STRIPE_PRICE_PRO;
      return isValidPriceId(envVal) ? envVal : PRICE_FALLBACKS.pro;
    }
    case 'enterprise': {
      const envVal = process.env.STRIPE_PRICE_ENTERPRISE;
      return isValidPriceId(envVal) ? envVal : PRICE_FALLBACKS.enterprise;
    }
    default: {
      const envVal = process.env.STRIPE_PRICE_SINGLE;
      return isValidPriceId(envVal) ? envVal : PRICE_FALLBACKS.single;
    }
  }
}

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');
  try {
    const { company, ticker, reportId, tier = 'single' } = await req.json() as {
      company?: string;
      ticker?: string;
      reportId?: string;
      tier?: Tier;
    };

    const priceId = getPriceId(tier);

    // Diagnostic log — visible in Vercel function logs
    console.log(`[stripe/checkout] tier=${tier} priceId=${priceId} source=${
      (tier === 'single' && process.env.STRIPE_PRICE_SINGLE) ||
      (tier === 'pro' && process.env.STRIPE_PRICE_PRO) ||
      (tier === 'enterprise' && process.env.STRIPE_PRICE_ENTERPRISE)
        ? 'env'
        : 'fallback'
    }`);

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
    console.error('[stripe/checkout] error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
