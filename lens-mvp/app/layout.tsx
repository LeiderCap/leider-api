import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ClerkProvider } from '@clerk/nextjs';
import NavAuth from '@/components/NavAuth';

export const metadata: Metadata = {
  title: 'The Lens™ — Transformation Intelligence',
  description: 'Discover hidden opportunities, trapped value, and transformation potential for any company, industry, or idea.',
  openGraph: {
    title: 'The Lens™ — Transformation Intelligence',
    description: 'The future is not limited by intelligence. It is limited by our ability to transform.',
    type: 'website',
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
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
                <Link href="/search" className="nav-link">Search</Link>
                <Link href="/saved" className="nav-link">Saved</Link>
                <Link href="/watchlists" className="nav-link">Watchlists</Link>
              </nav>
              <div className="flex items-center gap-2">
                <Link href="/search" className="btn btn-secondary">Run The Lens™</Link>
                <NavAuth />
              </div>
            </div>
          </header>
          {children}
          <footer className="border-t border-slate-200 bg-white px-6 py-10">
            <div className="mx-auto max-w-6xl">
              <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                <div>
                  <p className="font-bold">The Lens™</p>
                  <p className="mt-1 text-sm text-slate-500">Measurement system for Transformation Capacity™</p>
                </div>
                <p className="text-sm text-slate-400">
                  Transformation Intelligence™ · Equity Reclamation™ · AIROI™
                </p>
              </div>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
