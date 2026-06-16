'use client';

import { useEffect } from 'react';

export function MembershipActivator() {
  useEffect(() => {
    try {
      localStorage.setItem('founding_member', 'true');
    } catch {
      // localStorage not available (SSR guard)
    }
  }, []);

  return null;
}
