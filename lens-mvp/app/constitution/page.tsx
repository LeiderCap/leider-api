import Link from 'next/link';
import { principles, constitutionMeta } from '@/data/constitution';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Constitution of Transformation Intelligence™ | TI Registry™',
  description:
    'The governing principles behind The Lens™ and Transformation Intelligence™. Each principle is versioned, citable, and machine-readable.',
};

const statusColors: Record<string, string> = {
  Ratified: 'bg-green-100 text-green-800',
  Draft: 'bg-yellow-100 text-yellow-800',
  Proposed: 'bg-slate-100 text-slate-600',
};

// Group principles by category
function groupByCategory(items: typeof principles) {
  const groups: Record<string, typeof principles> = {};
  for (const p of items) {
    if (!groups[p.category]) groups[p.category] = [];
    groups[p.category].push(p);
  }
  return groups;
}

export default function ConstitutionPage() {
  const grouped = groupByCategory(principles);

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="border-b border-slate-200 bg-white px-6 py-16 text-center">
        <p
          className="mb-4 text-sm font-semibold uppercase tracking-widest"
          style={{ color: '#E05A00' }}
        >
          TI Registry™
        </p>
        <h1 className="mx-auto mb-4 max-w-2xl text-4xl font-bold text-slate-900">
          Constitution of Transformation Intelligence™
        </h1>
        <p className="mx-auto mb-6 max-w-xl text-lg text-slate-600">
          The governing principles behind The Lens™ and Transformation Intelligence™.
          Each principle is versioned, citable, and machine-readable.
        </p>
        <p className="text-sm text-slate-400">
          Author: {constitutionMeta.author} &nbsp;|&nbsp; Publisher:{' '}
          {constitutionMeta.publisher} &nbsp;|&nbsp; Version {constitutionMeta.version}{' '}
          &nbsp;|&nbsp; Published June 23, 2026
        </p>
      </section>

      {/* Machine-readable links */}
      <section className="border-b border-slate-100 bg-slate-50 px-6 py-4">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-4 text-sm text-slate-500">
          <span className="font-medium text-slate-700">Machine-readable:</span>
          <a
            href="/constitution.json"
            className="font-mono hover:underline"
            style={{ color: '#E05A00' }}
            target="_blank"
            rel="noopener noreferrer"
          >
            /constitution.json
          </a>
          <a
            href="/llms.txt"
            className="font-mono hover:underline"
            style={{ color: '#E05A00' }}
            target="_blank"
            rel="noopener noreferrer"
          >
            /llms.txt
          </a>
        </div>
      </section>

      {/* Principles list */}
      <section className="mx-auto max-w-4xl px-6 py-12">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="mb-12">
            <h2 className="mb-6 border-b border-slate-200 pb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
              {category}
            </h2>
            <div className="space-y-4">
              {items.map((p) => (
                <div
                  key={p.id}
                  className="rounded-lg border border-slate-200 bg-white p-6 transition-shadow hover:shadow-sm"
                >
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <span
                      className="font-mono text-sm font-bold"
                      style={{ color: '#E05A00' }}
                    >
                      {p.id}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColors[p.status] ?? 'bg-slate-100 text-slate-600'}`}
                    >
                      {p.status}
                    </span>
                    <span className="text-xs text-slate-400">v{p.version}</span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-slate-900">
                    {p.name}
                  </h3>
                  <p className="mb-4 text-slate-600">{p.principle}</p>
                  <Link
                    href={`/constitution/${p.slug}`}
                    className="text-sm font-medium hover:underline"
                    style={{ color: '#E05A00' }}
                  >
                    Read Principle →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Footer note */}
      <section className="border-t border-slate-200 bg-slate-50 px-6 py-8 text-center text-sm text-slate-400">
        <p>
          © {new Date().getFullYear()} Leider Capital. All principles are versioned and
          citable.{' '}
          <a
            href="/constitution.json"
            className="hover:underline"
            style={{ color: '#E05A00' }}
          >
            Download JSON
          </a>
        </p>
      </section>
    </main>
  );
}
