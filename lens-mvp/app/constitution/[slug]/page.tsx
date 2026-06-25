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

// Typed relationship badge colors
const REL_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  depends_on:   { bg: '#fee2e2', text: '#991b1b', label: 'DEPENDS ON' },
  extends:      { bg: '#dbeafe', text: '#1e40af', label: 'EXTENDS' },
  enables:      { bg: '#dcfce7', text: '#166534', label: 'ENABLES' },
  measured_by:  { bg: '#f3e8ff', text: '#6b21a8', label: 'MEASURED BY' },
  implements:   { bg: '#ccfbf1', text: '#0f766e', label: 'IMPLEMENTS' },
  derived_from: { bg: '#f1f5f9', text: '#475569', label: 'DERIVED FROM' },
  applies_to:   { bg: '#fef9c3', text: '#854d0e', label: 'APPLIES TO' },
  supports:     { bg: '#f0fdf4', text: '#15803d', label: 'SUPPORTS' },
  measures:     { bg: '#f3e8ff', text: '#6b21a8', label: 'MEASURES' },
};

export default function PrinciplePage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params.slug === 'string' ? params.slug : '';

  const idx = principles.findIndex((p) => p.slug === slug);
  const principle = idx >= 0 ? principles[idx] : null;
  const prev = idx > 0 ? principles[idx - 1] : null;
  const next = idx < principles.length - 1 ? principles[idx + 1] : null;

  const [copied, setCopied] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  useEffect(() => {
    if (!principle) {
      router.replace('/constitution');
    }
  }, [principle, router]);

  if (!principle) return null;

  // Enhanced citation text
  const canonicalUrl = `https://lensanalysis.com/constitution/${principle.slug}`;
  const citationText = `Leider, Stephen F. "${principle.name}." Constitution of Transformation Intelligence™, ${principle.id}, Version ${principle.version}, Leider Capital, ${formatDate(principle.published)}.${principle.lensUri ? ` Lens URI: ${principle.lensUri}.` : ''} Canonical URL: ${canonicalUrl}.`;

  // Machine-readable JSON citation
  const citationJson = JSON.stringify({
    id: principle.id,
    ...(principle.oid ? { oid: principle.oid } : {}),
    ...(principle.lensUri ? { lensUri: principle.lensUri } : {}),
    name: principle.name,
    version: principle.version,
    published: principle.published,
    author: 'Stephen F. Leider',
    publisher: 'Leider Capital',
    canonicalUrl,
    citationText,
  }, null, 2);

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
    url: canonicalUrl,
    isPartOf: {
      '@type': 'CreativeWork',
      name: 'Constitution of Transformation Intelligence™',
      url: 'https://lensanalysis.com/constitution',
    },
  };

  function handleCopy() {
    navigator.clipboard.writeText(citationText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleCopyJson() {
    navigator.clipboard.writeText(citationJson).then(() => {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    });
  }

  // Typed relationships: IDs covered by typed rels (to exclude from simple related list)
  const typedRelIds = new Set(
    (principle.typedRelationships ?? []).map((r) => r.targetId)
  );

  // Remaining related IDs not in typed relationships
  const remainingRelIds = principle.relatedIds.filter((id) => !typedRelIds.has(id));

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
              {principle.oid && (
                <div className="col-span-2 sm:col-span-3">
                  <dt className="text-slate-500">OID</dt>
                  <dd className="select-all font-mono text-xs text-slate-400">{principle.oid}</dd>
                </div>
              )}
              {principle.lensUri && (
                <div className="col-span-2 sm:col-span-3">
                  <dt className="text-slate-500">Lens URI</dt>
                  <dd className="select-all font-mono text-xs text-slate-400">{principle.lensUri}</dd>
                </div>
              )}
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

          {/* Typed Relationships */}
          {principle.typedRelationships && principle.typedRelationships.length > 0 && (
            <div>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                Typed Relationships
              </h2>
              <div className="space-y-3">
                {principle.typedRelationships.map((rel, i) => {
                  const badge = REL_BADGE[rel.type] ?? { bg: '#f1f5f9', text: '#475569', label: rel.type.toUpperCase().replace(/_/g, ' ') };
                  const target = principles.find((p) => p.id === rel.targetId);
                  return (
                    <div key={i} className="flex flex-col gap-1 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                          style={{ backgroundColor: badge.bg, color: badge.text }}
                        >
                          {badge.label}
                        </span>
                        <span className="text-slate-400 text-xs">→</span>
                        {target ? (
                          <Link
                            href={`/constitution/${target.slug}`}
                            className="text-sm font-semibold hover:underline"
                            style={{ color: '#E05A00' }}
                          >
                            {rel.targetId} — {target.name}
                          </Link>
                        ) : (
                          <span className="text-sm font-semibold text-slate-500">{rel.targetId}</span>
                        )}
                      </div>
                      <p className="text-xs italic text-slate-500 ml-1">{rel.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Related Principles (remaining IDs not covered by typed relationships) */}
          {(remainingRelIds.length > 0 || (principle.relatedIds.length > 0 && (!principle.typedRelationships || principle.typedRelationships.length === 0))) && (
            <div>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                Related Principles
              </h2>
              <div className="flex flex-wrap gap-2">
                {(principle.typedRelationships && principle.typedRelationships.length > 0 ? remainingRelIds : principle.relatedIds).map((id) => {
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
              <p className="font-mono text-sm text-slate-700 leading-relaxed mb-4">
                {citationText}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleCopy}
                  className="rounded px-3 py-1.5 text-sm font-medium text-white transition-colors"
                  style={{ backgroundColor: copied ? '#16a34a' : '#E05A00' }}
                >
                  {copied ? '✓ Copied' : 'Copy Text Citation'}
                </button>
                <button
                  onClick={handleCopyJson}
                  className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  style={copiedJson ? { backgroundColor: '#dcfce7', borderColor: '#16a34a', color: '#166534' } : {}}
                >
                  {copiedJson ? '✓ Copied JSON' : 'Copy JSON Citation'}
                </button>
              </div>
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
