import { NextResponse } from 'next/server';
import { createLensSnapshot, saveLensAnalysis, updateLensAnalysisGrounding } from '@/lib/lens-service';
import { getSupabaseClient } from '@/lib/supabase';
import { buildGroundTruthPromptContext } from '@/lib/lens/ground-truth';
import type { GroundTruth } from '@/lib/lens/ground-truth';
import { runFinancialGrounding } from '@/lib/financial_grounding';
import type { FinancialGroundingBundle } from '@/lib/financial_grounding';

export const maxDuration = 60;

async function logSearch(query: string, entityId?: string) {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    await supabase.from('searches').insert({ query });
    await supabase.from('transformation_events').insert({
      event_type: 'search',
      entity_id: entityId ?? null,
      event_data: { query, timestamp: new Date().toISOString() }
    });
  } catch {
    // Non-fatal
  }
}

function buildGroundTruthContext(identityCard: any): string {
  if (!identityCard) return '';
  return `GROUND TRUTH CONTEXT (Constitutional requirement — TI-015 Evidence Sufficiency Law™):

The following facts have been verified from retrieved source documents for ${identityCard.ticker}. You may not contradict this Ground Truth Context.

Company: ${identityCard.legal_name}
Exchange: ${identityCard.exchange}
Business: ${identityCard.business_description}
Products: ${(identityCard.products ?? []).join(', ')}
Customers: ${(identityCard.customer_segments ?? []).join(', ')}
Revenue Model: ${(identityCard.revenue_model ?? []).join(', ')}
Markets: ${(identityCard.markets_served ?? []).join(', ')}
Strategic Priorities: ${(identityCard.strategic_priorities ?? []).join(', ')}
Primary Risks: ${(identityCard.primary_risks ?? []).join(', ')}

OPERATING CONSTRAINT:
If a claim in your analysis is NOT supported by the retrieved source documents or Ground Truth Context, you MUST mark it as: [INFERENCE — not source confirmed]

Do not invent business lines, customers, revenue models, products, or strategic priorities that do not appear in the Ground Truth Context.

Do not describe this company as operating in a different industry than: ${(identityCard.markets_served ?? []).join(', ')}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const query = String(body.query ?? '').trim();
    const companyName: string = body.companyName ?? query;
    const exchange: string = body.exchange ?? '';
    const debug: boolean = body.debug === true;

    if (!query) {
      return NextResponse.json({ error: 'Query is required.' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://leider-api.vercel.app';

    // ── Step 1: Retrieve ────────────────────────────────────────────────────
    // Only run retrieval pipeline if we have a ticker-like query (1-5 uppercase letters)
    const looksLikeTicker = /^[A-Z]{1,5}$/.test(query.toUpperCase().trim()) ||
      /^(?:NYSE|NASDAQ|AMEX)\s*:?\s*[A-Z]{1,5}$/.test(query.toUpperCase().trim());

    let retrievalResult: any = null;
    let identityResult: any = null;
    let groundTruthObject: GroundTruth | null = null;
    let groundTruth: string | undefined;
    let resolvedTicker = looksLikeTicker
      ? query.toUpperCase().replace(/^(?:NYSE|NASDAQ|AMEX)\s*:?\s*/, '')
      : '';

    if (looksLikeTicker) {
      const ticker = resolvedTicker;

      try {
        const retrieveRes = await fetch(`${baseUrl}/api/lens/retrieve`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ ticker, companyName, exchange }),
        });
        if (retrieveRes.ok) {
          retrievalResult = await retrieveRes.json();
        }
      } catch (err) {
        console.warn('[lens/route] Retrieval failed (non-fatal):', err);
      }

      // ── Step 2: Identity card ─────────────────────────────────────────────
      if (retrievalResult) {
        try {
          const identityRes = await fetch(`${baseUrl}/api/lens/identity`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              ticker,
              companyName,
              auditId: retrievalResult.auditId,
              retrievedDocuments: retrievalResult.retrievedDocuments ?? [],
              fmpProfile: retrievalResult.fmpProfile ?? {},
              tickerNameMatch: retrievalResult.tickerNameMatch,
              minimumSourcesMet: retrievalResult.minimumSourcesMet,
            }),
          });
          if (identityRes.ok) {
            identityResult = await identityRes.json();
          }
        } catch (err) {
          console.warn('[lens/route] Identity failed (non-fatal):', err);
        }
      }

      // ── Step 3: Check for hard FAIL ───────────────────────────────────────
      if (identityResult?.identityCard?.identity_status === 'FAIL') {
        const failCard = identityResult.identityCard;
        return NextResponse.json({
          status: 'IDENTITY_FAIL',
          identityCard: failCard,
          failureReasons: failCard.failure_reasons ?? [],
          missingSource: retrievalResult?.requiredSources ?? {},
          retrievedDocuments: retrievalResult?.retrievedDocuments ?? [],
        });
      }

      // ── Step 4: Assemble Ground Truth Object™ if PASS or NEEDS_REVIEW ─────
      if (identityResult?.identityCard) {
        try {
          const gtRes = await fetch(`${baseUrl}/api/lens/ground-truth`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              ticker,
              companyName,
              retrievalResult,
              identityCard: identityResult.identityCard,
            }),
          });
          if (gtRes.ok) {
            const gtData = await gtRes.json();
            groundTruthObject = gtData.groundTruth ?? null;
            groundTruth = gtData.promptContext ?? buildGroundTruthContext(identityResult.identityCard);
          } else {
            groundTruth = buildGroundTruthContext(identityResult.identityCard);
          }
        } catch (err) {
          console.warn('[lens/route] GT assembly failed (non-fatal):', err);
          groundTruth = buildGroundTruthContext(identityResult.identityCard);
        }
      }
    }

    // ── Step 5: Generate Lens Analysis with ground truth ───────────────────
    const snapshot = await createLensSnapshot(query, {
      ticker: looksLikeTicker ? resolvedTicker : undefined,
      exchange: exchange || undefined,
      groundTruth,
    });

    logSearch(query, snapshot.id);

    // ── Step 6: Persist to lens_analyses (non-fatal) ───────────────────────
    const groundTruthId = groundTruthObject?.groundTruthId ?? null;
    const identityStatus = identityResult?.identityCard?.identity_status ?? null;
    let persistedOid: string | null = null;

    if (looksLikeTicker && resolvedTicker) {
      persistedOid = await saveLensAnalysis(
        snapshot,
        resolvedTicker,
        companyName || snapshot.name,
        exchange,
        groundTruthId,
        identityStatus,
      );
      // Override the AI-generated opportunity_id with the server-canonical OID™
      if (persistedOid) {
        (snapshot as any).opportunity_id = persistedOid;
      }
    }

    // ── Step 7: Financial Grounding Module (additive, non-fatal) ─────────────
    // Runs after tcs_numeric is available and after the analysis is persisted.
    // Failure never blocks report generation.
    let groundingData: FinancialGroundingBundle | null = null;
    if (looksLikeTicker && resolvedTicker && snapshot.tcs_numeric != null) {
      try {
        groundingData = await runFinancialGrounding(resolvedTicker, snapshot.tcs_numeric);
        if (groundingData && persistedOid) {
          // Update the stored row with the grounding data
          await updateLensAnalysisGrounding(persistedOid, groundingData as unknown as Record<string, unknown>);
        }
      } catch (err) {
        console.warn(`[lens/route] Financial grounding failed for ${resolvedTicker} (non-fatal):`, err);
        groundingData = null;
      }
    }

    // ── Step 8: Build response — include financial_grounding only if present ─
    const responsePayload: Record<string, unknown> = {
      snapshot,
      status: 'SUCCESS',
      identityCard: identityResult?.identityCard ?? null,
      identityStatus,
      retrievedDocuments: retrievalResult?.retrievedDocuments ?? [],
      groundTruthId,
      oid: persistedOid,
    };
    if (groundingData !== null) {
      responsePayload.financial_grounding = groundingData;
    }
    if (debug) {
      responsePayload.groundTruthObject = groundTruthObject;
      responsePayload.groundTruth = groundTruth;
    }

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error('Lens generation failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Lens generation failed.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') ?? '';
  return POST(new Request(request.url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query })
  }));
}
