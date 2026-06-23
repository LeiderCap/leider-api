'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { principles } from '@/data/constitution';

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export default function PrinciplePage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params.slug === 'string' ? params.slug : '';

  const idx = principles.findIndex((p) => p.slug === slug);
  const principle = idx >= 0 ? principles[idx] : null;
  const prev = idx > 0 ? principles[idx - 1] : null;
  const next = idx < principles.length - 1 ? principles[idx + 1] : null;

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!principle) {
      router.replace('/constitution');
    }
  }, [principle, router]);

  if (!principle) return null;

  const citation = `Leider, Stephen F. "${principle.name}." Constitution of Transformation Intelligence™, ${principle.id}, Version ${principle.version}, Leider Capital, ${formatDate(principle.published)}.`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    identifier: principle.id,
    name: principle.name,
    headline: `${principle.id} · ${principle.name}`,
    author: {
      '@type': 'Person',
      name: 'Stephen F. Leider',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Leider Capital',
      url: 'https://lensanalysis.com',
    },
    datePublished: principle.published,
    version: principle.version,
    url: `https://lensanalysis.com/constitution/${principle.slug}`,
    isPartOf: {
      '@type': 'CreativeWork',
      name: 'Constitution of Transformation Intelligence™',
      url: 'https://lensanalysis.com/constitution',
    },
  };

  function handleCopy() {
    navigator.clipboard.writeText(citation).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-white">
        {/* Dark header */}
        <section className="bg-slate-950 px-6 py-14 text-white">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/constitution"
              className="mb-6 inline-block text-sm text-slate-400 hover:text-white"
            >
              ← Back to Constitution
            </Link>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span
                className="font-mono text-lg font-bold"
                style={{ color: '#E05A00' }}
              >
                {principle.id}
              </span>
              <span className="rounded-full bg-green-900 px-2 py-0.5 text-xs font-semibold text-green-300">
                {principle.status}
              </span>
              <span className="text-xs text-slate-400">v{principle.version}</span>
            </div>
            <h1 className="mb-6 text-3xl font-bold leading-tight">{principle.name}</h1>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-slate-500">Published</dt>
                <dd className="text-slate-200">{formatDate(principle.published)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Author</dt>
                <dd className="text-slate-200">{principle.author}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Publisher</dt>
                <dd className="text-slate-200">{principle.publisher}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Canonical URL</dt>
                <dd className="font-mono text-xs text-slate-300">
                  lensanalysis.com/constitution/{principle.slug}
                </dd>
              </div>
              <div className="col-span-2 sm:col-span-2">
                <dt className="text-slate-500">Part of</dt>
                <dd className="text-slate-200">
                  Constitution of Transformation Intelligence™
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Body */}
        <section className="mx-auto max-w-3xl px-6 py-12 space-y-10">
          {/* Principle */}
          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
              Principle
            </h2>
            <p className="text-2xl font-semibold leading-snug text-slate-900">
              {principle.principle}
            </p>
          </div>

          {/* Definition */}
          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
              Definition
            </h2>
            <p className="text-slate-700 leading-relaxed">{principle.definition}</p>
          </div>

          {/* Operating Law */}
          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
              Operating Law
            </h2>
            <blockquote className="border-l-4 pl-4 text-slate-700 leading-relaxed italic" style={{ borderColor: '#E05A00' }}>
              {principle.operatingLaw}
            </blockquote>
          </div>

          {/* Implications */}
          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
              Implications
            </h2>
            <ul className="space-y-2">
              {principle.implications.map((imp, i) => (
                <li key={i} className="flex gap-3 text-slate-700">
                  <span style={{ color: '#E05A00' }} className="mt-0.5 shrink-0 font-bold">
                    {i + 1}.
                  </span>
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Related Principles */}
          {principle.relatedIds.length > 0 && (
            <div>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                Related Principles
              </h2>
              <div className="flex flex-wrap gap-2">
                {principle.relatedIds.map((id) => {
                  const related = principles.find((p) => p.id === id);
                  return related ? (
                    <Link
                      key={id}
                      href={`/constitution/${related.slug}`}
                      className="rounded border border-slate-200 px-3 py-1.5 text-sm font-medium hover:border-orange-300 hover:bg-orange-50 transition-colors"
                      style={{ color: '#E05A00' }}
                    >
                      {id} — {related.name}
                    </Link>
                  ) : (
                    <span
                      key={id}
                      className="rounded border border-slate-200 px-3 py-1.5 text-sm text-slate-400"
                    >
                      {id}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Citation */}
          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
              Citation
            </h2>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
              <p className="font-mono text-sm text-slate-700 leading-relaxed mb-3">
                {citation}
              </p>
              <button
                onClick={handleCopy}
                className="rounded px-3 py-1.5 text-sm font-medium text-white transition-colors"
                style={{ backgroundColor: copied ? '#16a34a' : '#E05A00' }}
              >
                {copied ? '✓ Copied' : 'Copy citation'}
              </button>
            </div>
          </div>
        </section>

        {/* Prev / Next navigation */}
        <section className="border-t border-slate-200 bg-slate-50 px-6 py-8">
          <div className="mx-auto flex max-w-3xl items-center justify-between">
            {prev ? (
              <Link
                href={`/constitution/${prev.slug}`}
                className="group flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
              >
                <span>←</span>
                <span>
                  <span className="block text-xs text-slate-400">Previous</span>
                  <span className="font-medium group-hover:underline">{prev.id} — {prev.name}</span>
                </span>
              </Link>
            ) : (
              <div />
            )}
            {next ? (
              <Link
                href={`/constitution/${next.slug}`}
                className="group flex items-center gap-2 text-right text-sm text-slate-600 hover:text-slate-900"
              >
                <span>
                  <span className="block text-xs text-slate-400">Next</span>
                  <span className="font-medium group-hover:underline">{next.id} — {next.name}</span>
                </span>
                <span>→</span>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </section>
      </main>
    </>
  );
}
