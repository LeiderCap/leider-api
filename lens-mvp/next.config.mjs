/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    const noindex = [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }];
    // Proposed non-secret flag: set only in the staging project after approval.
    // Do not use VERCEL_ENV=production to infer that a staging project is public.
    if (process.env.LENS_STAGING_NOINDEX === 'true') {
      return [{ source: '/:path*', headers: noindex }];
    }
    // Public landing pages and /sitemap.xml are not blanket-blocked by default.
    return [
      '/api/:path*',
      '/saved/:path*',
      '/watchlists/:path*',
      '/lens/:path*',
      '/reports/:report/result',
      '/sign-in/:path*',
      '/sign-up/:path*',
    ].map((source) => ({ source, headers: noindex }));
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
