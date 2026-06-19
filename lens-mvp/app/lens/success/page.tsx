import Stripe from 'stripe';
import Link from 'next/link';
import { MembershipActivator } from '@/components/MembershipActivator';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params.session_id;

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Invalid Session</h1>
          <p className="text-slate-600 mt-2">No session found. Please try again.</p>
          <Link href="/search" className="inline-block mt-4 bg-orange-500 text-slate-900 font-bold px-6 py-3 rounded-xl">Return to Search</Link>
        </div>
      </div>
    );
  }

  let isPaid = false;
  let customerEmail = '';
  let tier: string = 'single';

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    isPaid = session.status === 'complete' || session.payment_status === 'paid';
    customerEmail = session.customer_details?.email ?? '';
    tier = session.metadata?.tier ?? 'single';
  } catch (err) {
    console.error('Stripe session lookup error:', err);
  }

  if (!isPaid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-slate-900">Payment Not Confirmed</h1>
          <p className="text-slate-600 mt-2">We could not verify your payment. If you completed checkout, please wait a moment and refresh.</p>
          <Link href="/search" className="inline-block mt-4 bg-orange-500 text-slate-900 font-bold px-6 py-3 rounded-xl">Return to Search</Link>
        </div>
      </div>
    );
  }

  const tierLabel =
    tier === 'enterprise' ? 'Lens Enterprise' :
    tier === 'pro' ? 'Lens Pro' :
    'Single Report';

  const reportsLabel =
    tier === 'enterprise' ? 'Unlimited reports' :
    tier === 'pro' ? '50 reports' :
    '1 report';

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        <MembershipActivator />
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">✦</span>
        </div>
        <p className="text-orange-500 font-semibold uppercase tracking-wide text-sm mb-2">
          Transformation Intelligence Report™
        </p>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Access Unlocked
        </h1>
        <p className="text-slate-500 text-sm mb-4 font-medium">{tierLabel} — {reportsLabel}</p>
        <p className="text-slate-600 mb-8">
          {customerEmail ? `${customerEmail} — your` : 'Your'} report access is now active. Redirecting to your report…
        </p>
        <div className="bg-slate-50 rounded-xl p-6 text-left mb-8 space-y-3">
          <p className="font-semibold text-slate-900 mb-3">What&apos;s now unlocked:</p>
          {[
            'Transformation Intelligence Report™',
            'Transformation Blueprint access',
            'Discovery Intelligence section',
            'PDF export',
          ].map((item) => (
            <div key={item} className="flex items-start gap-3">
              <span className="text-orange-500 mt-0.5">✓</span>
              <span className="text-slate-700">{item}</span>
            </div>
          ))}
        </div>
        <Link
          href="/search"
          className="block w-full bg-orange-500 hover:bg-orange-600 text-slate-900 font-bold py-4 rounded-xl transition-colors"
        >
          Start Exploring The Lens
        </Link>
      </div>
    </div>
  );
}
