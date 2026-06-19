'use client';
import { useEffect } from 'react';
import { slugify } from '@/lib/ids';

export function MembershipActivator() {
  useEffect(() => {
    try {
      // 1. Read tier from pre-checkout storage
      const tier = localStorage.getItem('pre_checkout_tier') ?? 'single';
      const companyName = localStorage.getItem('pre_checkout_company');
      const ticker = localStorage.getItem('pre_checkout_ticker');

      // 2. Set tier-based access in localStorage
      localStorage.setItem('lens_access_tier', tier);
      localStorage.setItem(
        'lens_reports_remaining',
        tier === 'single' ? '1' : tier === 'pro' ? '50' : 'unlimited'
      );

      // 3. Clean up pre-checkout keys
      localStorage.removeItem('pre_checkout_company');
      localStorage.removeItem('pre_checkout_ticker');
      localStorage.removeItem('pre_checkout_tier');

      // 4. Redirect to the company's Lens Card detail page with report unlocked
      if (companyName) {
        const id = slugify(companyName);
        window.location.href = `/lens/${id}?unlocked=true`;
      }
    } catch {
      // localStorage not available (SSR guard)
    }
  }, []);

  return null;
}
