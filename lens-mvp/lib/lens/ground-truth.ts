/**
 * Ground Truth Object™ — Truth Engine™ Layer 1
 *
 * The GroundTruth object is the single source of truth for every Lens run.
 * It is assembled from retrieved documents + identity verification and is
 * immutable once created. All downstream AI modules receive this object
 * and may not contradict its verified facts.
 *
 * Constitutional basis: TI-015 (Evidence Sufficiency Law™), TI-010 (LKAS™)
 */

import crypto from 'crypto';
import { LENS_VERSIONS } from './versions';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GroundTruthCitation {
  factId: string;
  fact: string;
  sourceTitle: string;
  sourceType: string;
  sourceUrl: string | null;
  confidence: number;
}

export interface GroundTruthDocument {
  sourceType: string;
  title: string;
  url: string | null;
  relevanceScore: number;
  tokensUsed: number;
  includedInPrompt: boolean;
  excludedReason: string | null;
  content?: string | null;  // raw document content (e.g. SEC filing body excerpts)
}

export interface GroundTruth {
  // Identity
  groundTruthId: string;        // format: GT-{YYYY}-{TICKER}-{NNN}
  version: string;              // schema version, e.g. "1.0"
  generatedAt: string;          // ISO timestamp

  // Company Identity
  companyIdentity: {
    ticker: string;
    legalName: string;
    exchange: string;
    sector: string;
    industry: string;
    marketCap: number | null;
  };

  // Verified Facts
  verifiedFacts: {
    businessDescription: string;
    products: string[];
    customerSegments: string[];
    revenueModel: string[];
    marketsServed: string[];
    strategicPriorities: string[];
    primaryRisks: string[];
    valueUnlockOpportunities: string[];
  };

  // Citations
  citations: GroundTruthCitation[];

  // Confidence Scores
  confidenceScores: {
    overall: number;
    businessDescription: number;
    products: number;
    customers: number;
    revenueModel: number;
    strategicPriorities: number;
    risks: number;
  };

  // Retrieved Documents
  retrievedDocuments: GroundTruthDocument[];

  // Verification
  identityStatus: 'PASS' | 'FAIL' | 'NEEDS_REVIEW';
  failureReasons: string[];
  minimumSourcesMet: boolean;
  tickerNameMatch: boolean;

  // Versioning
  sourceHash: string;           // SHA256 of all doc titles + URLs
  auditId: string | null;       // references lens_retrieval_audits.id
  promptVersion: string;
  modelVersion: string;
  constitutionVersion: string;
}

// ── Utilities ─────────────────────────────────────────────────────────────────

export function computeSourceHash(documents: Array<{ title: string; url?: string | null }>): string {
  const input = documents
    .map(d => d.title + (d.url || ''))
    .sort()
    .join('|');
  return crypto.createHash('sha256').update(input).digest('hex');
}

export function buildGroundTruthPromptContext(gt: GroundTruth): string {
  const includedDocs = gt.retrievedDocuments.filter(d => d.includedInPrompt);
  return `GROUND TRUTH OBJECT™
ID: ${gt.groundTruthId}
Version: ${gt.version}
Generated: ${gt.generatedAt}
Source Hash: ${gt.sourceHash}
Identity Status: ${gt.identityStatus}
Confidence: ${(gt.confidenceScores.overall * 100).toFixed(0)}%

VERIFIED COMPANY FACTS:
Legal Name: ${gt.companyIdentity.legalName}
Exchange: ${gt.companyIdentity.exchange}
Sector: ${gt.companyIdentity.sector}
Business: ${gt.verifiedFacts.businessDescription}
Products: ${gt.verifiedFacts.products.join(', ')}
Customers: ${gt.verifiedFacts.customerSegments.join(', ')}
Revenue Model: ${gt.verifiedFacts.revenueModel.join(', ')}
Markets: ${gt.verifiedFacts.marketsServed.join(', ')}
Strategic Priorities: ${gt.verifiedFacts.strategicPriorities.join(', ')}
Primary Risks: ${gt.verifiedFacts.primaryRisks.join(', ')}

SOURCES USED (${includedDocs.length} documents):
${includedDocs.map((d, i) => {
  const base = `${i + 1}. [${d.sourceType}] ${d.title}`;
  // For SEC filings, append the body excerpt so the model has actual deal facts
  // (deal price, counterparty, financing terms) not just a filing link.
  if (d.sourceType === 'sec_filing' && d.content) {
    return `${base}\n${d.content}`;
  }
  return base;
}).join('\n')}

Any claim not supported by these sources must be marked [INFERENCE].

${(() => {
  const companyOverrides: Record<string, string> = {
    'PL': "Planet Labs PBC operates the world's largest fleet of commercial Earth-imaging satellites. Core business: satellite imagery, geospatial data, Earth observation. Sector: Aerospace & Defense / Industrials. NOT a communications or software company.",
  };
  const overrideContext = companyOverrides[gt.companyIdentity.ticker?.toUpperCase() ?? ''];
  if (overrideContext) {
    return `COMPANY FACT OVERRIDE (authoritative — supersedes all other sources):\n${overrideContext}`;
  }
  return '';
})()}`;
}

export function assembleGroundTruth(params: {
  groundTruthId: string;
  ticker: string;
  auditId: string | null;
  retrievalResult: {
    retrievedDocuments: any[];
    fmpProfile: any;
    tickerNameMatch: boolean;
    minimumSourcesMet: boolean;
  };
  identityCard: any;
}): GroundTruth {
  const { groundTruthId, ticker, auditId, retrievalResult, identityCard } = params;
  const fmp = retrievalResult.fmpProfile ?? {};

  const docs: GroundTruthDocument[] = (retrievalResult.retrievedDocuments ?? []).map((d: any) => ({
    sourceType: d.source_type ?? d.sourceType ?? 'unknown',
    title: d.title ?? '',
    url: d.url ?? null,
    relevanceScore: d.relevance_score ?? d.relevanceScore ?? 1.0,
    tokensUsed: d.tokens_used ?? d.tokensUsed ?? 0,
    includedInPrompt: d.included_in_prompt ?? d.includedInPrompt ?? true,
    excludedReason: d.excluded_reason ?? d.excludedReason ?? null,
    content: d.content ?? null,  // preserve raw content (e.g. SEC filing body excerpts)
  }));

  const sourceHash = computeSourceHash(docs);

  const overallConf = identityCard?.source_confidence ?? 0;

  return {
    groundTruthId,
    version: LENS_VERSIONS.groundTruthSchemaVersion,
    generatedAt: new Date().toISOString(),

    companyIdentity: {
      ticker: ticker.toUpperCase(),
      legalName: identityCard?.legal_name ?? fmp.companyName ?? ticker,
      exchange: identityCard?.exchange ?? fmp.exchangeShortName ?? '',
      sector: fmp.sector ?? '',
      industry: fmp.industry ?? '',
      marketCap: fmp.mktCap ?? null,
    },

    verifiedFacts: {
      businessDescription: identityCard?.business_description ?? fmp.description ?? '',
      products: identityCard?.products ?? [],
      customerSegments: identityCard?.customer_segments ?? [],
      revenueModel: identityCard?.revenue_model ?? [],
      marketsServed: identityCard?.markets_served ?? [],
      strategicPriorities: identityCard?.strategic_priorities ?? [],
      primaryRisks: identityCard?.primary_risks ?? [],
      valueUnlockOpportunities: identityCard?.identity_questions?.value_unlock_opportunities?.answer
        ? [identityCard.identity_questions.value_unlock_opportunities.answer]
        : [],
    },

    citations: (identityCard?.source_citations ?? []).map((c: string, i: number) => ({
      factId: `FACT-${String(i + 1).padStart(3, '0')}`,
      fact: c,
      sourceTitle: docs[i]?.title ?? c,
      sourceType: docs[i]?.sourceType ?? 'unknown',
      sourceUrl: docs[i]?.url ?? null,
      confidence: overallConf,
    })),

    confidenceScores: {
      overall: overallConf,
      businessDescription: identityCard?.business_description_confidence ?? overallConf,
      products: overallConf,
      customers: overallConf,
      revenueModel: overallConf,
      strategicPriorities: overallConf,
      risks: overallConf,
    },

    retrievedDocuments: docs,

    identityStatus: identityCard?.identity_status ?? 'NEEDS_REVIEW',
    failureReasons: identityCard?.failure_reasons ?? [],
    minimumSourcesMet: retrievalResult.minimumSourcesMet ?? false,
    tickerNameMatch: retrievalResult.tickerNameMatch ?? true,

    sourceHash,
    auditId,
    promptVersion: LENS_VERSIONS.promptVersion,
    modelVersion: LENS_VERSIONS.modelVersion,
    constitutionVersion: LENS_VERSIONS.constitutionVersion,
  };
}
