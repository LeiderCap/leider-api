'use client';
import { useEffect } from 'react';

export function MembershipActivator() {
  useEffect(() => {
    try {
      // 1. Mark this browser as a Founding Member
      localStorage.setItem('founding_member', 'true');

      // 2. Read the company the user was viewing before checkout
      const companyName = localStorage.getItem('pre_checkout_company');
      const ticker = localStorage.getItem('pre_checkout_ticker');

      if (companyName) {
        // 3. Clean up the pre-checkout keys
        localStorage.removeItem('pre_checkout_company');
        localStorage.removeItem('pre_checkout_ticker');

        // 4. Redirect to Blueprint™ for that company
        const entityParam = encodeURIComponent(companyName);
        const sourceParam = ticker ? encodeURIComponent(ticker) : entityParam;
        window.location.href = `/blueprint?entity=${entityParam}&source=${sourceParam}`;
      }
    } catch {
      // localStorage not available (SSR guard)
    }
  }, []);

  return null;
}
