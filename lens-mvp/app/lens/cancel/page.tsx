import Link from 'next/link';

export default function CancelPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
          Checkout Cancelled
        </p>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          No problem.
        </h1>
        <p className="text-slate-600 mb-6">
          Your free Lens Scorecard™ is still available. You can upgrade to a Founding Transformation Member™ anytime.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/search"
            className="btn btn-primary w-full py-3 text-base font-bold"
          >
            Return to Search
          </Link>
          <p className="text-xs text-slate-400">
            Questions? <a href="mailto:hello@leider.com" className="underline hover:text-slate-600">Contact us</a>
          </p>
        </div>
      </div>
    </main>
  );
}
