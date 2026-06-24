import { OpportunityZonesSection } from '@/components/OpportunityZonesSection';
import Link from 'next/link';

export const metadata = {
  title: 'Lens Opportunities™ | The Lens™',
  description: 'Discover where value may be trapped across public markets. Seven classification zones powered by The Lens™ deterministic classification engine.',
};

export default function OpportunitiesPage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
      <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        ← Back
      </Link>

      <div className="mt-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">The Lens™</p>
        <h1 className="mt-1 text-3xl font-bold" style={{ color: '#E05A00' }}>Lens Opportunities™</h1>
        <p className="mt-2 text-sm text-slate-500 max-w-xl">
          Discover where value may be trapped across public markets. Seven classification zones powered by
          The Lens™ deterministic classification engine — rules classify, AI interprets.
        </p>
      </div>

      <OpportunityZonesSection />
    </main>
  );
}
