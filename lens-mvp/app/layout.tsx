import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'The Lens™ — Turn the Dial. Explore What’s Possible.',
  description: 'The Lens™ reveals opportunities, risks, constraints, and possibilities that are difficult to see from a single perspective. Transformation Intelligence™ helps you discover what others miss.',
  openGraph: {
    title: 'The Lens™ — Turn the Dial. Explore What’s Possible.',
    description: 'The Lens™ reveals opportunities, risks, constraints, and possibilities that are difficult to see from a single perspective.',
    type: 'website',
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight">The Lens™</span>
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              <Link href="/#the-problem" className="nav-link">The Problem</Link>
              <Link href="/#transformation-chain" className="nav-link">Framework</Link>
              <Link href="/#for-whom" className="nav-link">Who It's For</Link>
              <Link href="/methodology" className="nav-link">Methodology</Link>
              <Link href="/search" className="nav-link">Search</Link>
              <Link href="/saved" className="nav-link">Saved</Link>
              <Link href="/watchlists" className="nav-link">Watchlists</Link>
            </nav>
            <div className="flex items-center gap-2">
              <Link href="/search" className="btn btn-secondary">Run The Lens™</Link>
            </div>
          </div>
        </header>
        {children}
        <footer className="border-t border-slate-200 bg-white px-6 py-12">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-10 sm:grid-cols-3">
              {/* Brand */}
              <div>
                <p className="font-bold text-slate-900">The Lens™</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">See reality. Find opportunity. Know what to do next.</p>
                <p className="mt-3 text-xs text-slate-400">Transformation Intelligence™ · Equity Reclamation™ · AIROI™</p>
              </div>
              {/* Learn */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Learn</p>
                <ul className="mt-4 space-y-2">
                  <li><Link href="/lens-card" className="text-sm text-slate-600 hover:text-teal-600 transition-colors">What is a Lens Card™?</Link></li>
                  <li><Link href="/methodology" className="text-sm text-slate-600 hover:text-teal-600 transition-colors">Methodology</Link></li>
                  <li><Link href="/assessment" className="text-sm text-slate-600 hover:text-teal-600 transition-colors">Assessment Methodology</Link></li>
                </ul>
              </div>
              {/* Solutions */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Solutions</p>
                <ul className="mt-4 space-y-2">
                  <li><Link href="/enterprises" className="text-sm text-slate-600 hover:text-teal-600 transition-colors">For Enterprises</Link></li>
                  <li><Link href="/investors" className="text-sm text-slate-600 hover:text-teal-600 transition-colors">For Investors</Link></li>
                  <li><Link href="/governments" className="text-sm text-slate-600 hover:text-teal-600 transition-colors">For Governments</Link></li>
                  <li><Link href="/individuals" className="text-sm text-slate-600 hover:text-teal-600 transition-colors">For Individuals</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
