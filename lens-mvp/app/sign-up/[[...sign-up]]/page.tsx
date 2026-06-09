import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-20">
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">The Lens™</p>
          <h1 className="mt-2 text-3xl font-bold">Create Account</h1>
          <p className="mt-2 text-slate-500">Save Lens Cards™ and build your watchlists.</p>
        </div>
        <SignUp />
      </div>
    </main>
  );
}
