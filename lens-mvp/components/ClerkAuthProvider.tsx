'use client';

import { ClerkProvider } from '@clerk/nextjs';

export default function ClerkAuthProvider({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) return <>{children}</>;
  const signInUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/sign-in';
  const signUpUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '/sign-up';
  return (
    <ClerkProvider publishableKey={publishableKey} signInUrl={signInUrl} signUpUrl={signUpUrl}>
      {children}
    </ClerkProvider>
  );
}
