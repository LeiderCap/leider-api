'use client';

import { SignInButton, UserButton, useAuth } from '@clerk/nextjs';

export default function NavAuth() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !isLoaded) return null;

  if (isSignedIn) return <UserButton />;

  return (
    <SignInButton mode="modal">
      <button type="button" className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-500">
        Sign in
      </button>
    </SignInButton>
  );
}
