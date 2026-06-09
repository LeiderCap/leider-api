'use client';

import { SignInButton, SignUpButton, SignOutButton, Show, UserButton } from '@clerk/nextjs';

export default function NavAuth() {
  return (
    <>
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button className="btn btn-ghost text-sm">Sign In</button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="btn btn-primary text-sm">Sign Up</button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </>
  );
}
