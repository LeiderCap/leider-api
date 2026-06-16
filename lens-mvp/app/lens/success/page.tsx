import Link from 'next/link';
import Stripe from 'stripe';

interface SuccessPageProps {
  searchParams: { session_id?: string };
}

async function getSession(sessionId: string) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session;
  } catch {
    return null;
  }
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const sessionId = searchParams.session_id;
  const session = sessionId ? await getSession(sessionId) : null;
  const isPaid = session?.payment_status === 'paid';
  const company = session?.metadata?.company ?? '';

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {isPaid ? (
          <>
            {/* Success state */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <p className="text-[10px] font-bold uppercase tracking-widest text-orange-500 mb-2">
              Founding Transformation Member™
            </p>
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              Welcome, Founding Member™
            </h1>
            <p className="text-slate-600 mb-2">
              Your Full Lens Analysis™ is now available.
            </p>
            {company && (
              <p className="text-sm text-slate-500 mb-6">
                You now have full access to the {company} Lens Analysis™.
              </p>
            )}

            <div className="rounded-xl border border-slate-200 bg-white p-5 text-left mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                Your Founding Member Benefits
              </p>
              <ul className="space-y-2 text-sm text-slate-700">
                {[
                  'Full Lens Analysis™ for every company',
                  'Expanded opportunity analysis',
                  'Strategic constraints deep-dive',
                  'Value drivers & risk factors',
                  'First 90-day recommendations',
                  'Downloadable Transformation Blueprint™',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="/blueprint"
                className="btn btn-primary w-full py-3 text-base font-bold"
              >
                Request Transformation Blueprint™
              </Link>
              <Link
                href="/search"
                className="btn btn-secondary w-full py-3 text-base"
              >
                Return to Search
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Pending / unverified state */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
              <svg className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 mb-3">
              Payment Processing
            </h1>
            <p className="text-slate-600 mb-6">
              Your payment is being processed. If you completed checkout, your access will be activated shortly.
            </p>
            <Link href="/search" className="btn btn-primary px-8 py-3">
              Return to Search
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
