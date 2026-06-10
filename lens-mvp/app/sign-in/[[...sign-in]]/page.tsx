import Link from 'next/link';

// Sign-in page — Clerk auth will be added back in a future task
export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-20">
      <div className="flex flex-col items-center gap-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">The Lens™</p>
        <h1 className="text-3xl font-bold">Sign In</h1>
        <p className="text-slate-500">Authentication is coming soon.</p>
        <Link href="/search" className="btn btn-primary">Run The Lens™</Link>
      </div>
    </main>
  );
}
