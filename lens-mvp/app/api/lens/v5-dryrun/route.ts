/**
 * /api/lens/v5-dryrun — Internal test-only route for Lens Synthesis Engine v5.0
 *
 * Phase 3: LSE-P3 Dry-Run Test Path
 *
 * PURPOSE: Runs the full real production pipeline (retrieve → identity → ground-truth →
 * v5.0 generation → persist) for a given ticker, but saves the result as a clearly-marked
 * test record (is_test_record=true, is_public=false, is_latest=false).
 *
 * SAFETY GUARANTEES:
 * - This route is NOT reachable from any live user-facing search or report flow.
 * - It requires a secret header (X-Dryrun-Secret) to prevent accidental invocation.
 * - Test records do NOT displace the current live `is_latest` record for any ticker.
 * - Test records are NOT public and will not appear in any user-facing query.
 * - This route does NOT modify any live routing, UI component, or default behavior.
 *
 * USAGE (internal only):
 *   POST /api/lens/v5-dryrun
 *   Headers: X-Dryrun-Secret: <LENS_V5_DRYRUN_SECRET env var>
 *   Body: { "ticker": "FOUR" }
 *
 * RESPONSE:
 *   { oid, ticker, lensEngineVersion, snapshot, groundTruthId, identityStatus, errors }
 */

import { NextResponse } from 'next/server';
import { saveLensAnalysis } from '@/lib/lens-service';
import { buildGroundTruthPromptContext } from '@/lib/lens/ground-truth';
import type { GroundTruth } from '@/lib/lens/ground-truth';
import { callLensEngineV5, deriveV5LegacyFields } from '@/lib/lens-ai-v5';
import type { LensSnapshot } from '@/lib/types';

export const maxDuration = 120;  // v5.0 generation can take up to 90s

// ── Secret guard — prevents accidental invocation from live flows ─────────────
const DRYRUN_SECRET = process.env.LENS_V5_DRYRUN_SECRET;

function buildLegacyGroundTruthContext(identityCard: any): string {
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
  const startTime = Date.now();
  const errors: string[] = [];

  try {
    // ── Secret guard ────────────────────────────────────────────────────────────
    const providedSecret = request.headers.get('x-dryrun-secret');
    if (DRYRUN_SECRET && providedSecret !== DRYRUN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // If LENS_V5_DRYRUN_SECRET is not set, allow in development only
    if (!DRYRUN_SECRET && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'LENS_V5_DRYRUN_SECRET must be set in production' },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const ticker = String(body.ticker ?? '').trim().toUpperCase();
    const companyName: string = body.companyName ?? ticker;
    const exchange: string = body.exchange ?? '';

    if (!ticker || !/^[A-Z]{1,5}$/.test(ticker)) {
      return NextResponse.json(
        { error: 'ticker is required and must be 1-5 uppercase letters' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://leider-api.vercel.app';

    // ── Step 1: Real retrieval pipeline ────────────────────────────────────────
    let retrievalResult: any = null;
    try {
      const retrieveRes = await fetch(`${baseUrl}/api/lens/retrieve`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ticker, companyName, exchange }),
      });
      if (retrieveRes.ok) {
        retrievalResult = await retrieveRes.json();
        console.log(`[v5-dryrun] Retrieval OK: ${retrievalResult?.retrievedDocuments?.length ?? 0} docs`);
      } else {
        const msg = `Retrieval returned ${retrieveRes.status}`;
        errors.push(msg);
        console.warn(`[v5-dryrun] ${msg}`);
      }
    } catch (err) {
      const msg = `Retrieval failed: ${err instanceof Error ? err.message : String(err)}`;
      errors.push(msg);
      console.warn(`[v5-dryrun] ${msg}`);
    }

    // ── Step 2: Real identity verification ─────────────────────────────────────
    let identityResult: any = null;
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
          console.log(`[v5-dryrun] Identity OK: ${identityResult?.identityCard?.identity_status}`);
        } else {
          const msg = `Identity returned ${identityRes.status}`;
          errors.push(msg);
          console.warn(`[v5-dryrun] ${msg}`);
        }
      } catch (err) {
        const msg = `Identity failed: ${err instanceof Error ? err.message : String(err)}`;
        errors.push(msg);
        console.warn(`[v5-dryrun] ${msg}`);
      }
    }

    // ── Step 3: Check for hard FAIL (same logic as production) ─────────────────
    if (identityResult?.identityCard?.identity_status === 'FAIL') {
      return NextResponse.json({
        status: 'IDENTITY_FAIL',
        ticker,
        identityCard: identityResult.identityCard,
        failureReasons: identityResult.identityCard.failure_reasons ?? [],
        errors,
      });
    }

    // ── Step 4: Real ground truth assembly ─────────────────────────────────────
    let groundTruthObject: GroundTruth | null = null;
    let groundTruth: string | undefined;
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
          groundTruth = gtData.promptContext ?? buildLegacyGroundTruthContext(identityResult.identityCard);
          console.log(`[v5-dryrun] Ground truth OK: ${groundTruth?.length ?? 0} chars`);
        } else {
          const msg = `Ground truth returned ${gtRes.status}`;
          errors.push(msg);
          groundTruth = buildLegacyGroundTruthContext(identityResult.identityCard);
        }
      } catch (err) {
        const msg = `Ground truth failed: ${err instanceof Error ? err.message : String(err)}`;
        errors.push(msg);
        groundTruth = buildLegacyGroundTruthContext(identityResult.identityCard);
      }
    }

    // ── Step 5: v5.0 generation ─────────────────────────────────────────────────
    const genStart = Date.now();
    const rawJson = await callLensEngineV5(ticker, groundTruth ?? undefined);
    const genMs = Date.now() - genStart;

    if (!rawJson) {
      return NextResponse.json(
        { error: 'v5.0 engine returned null', ticker, errors },
        { status: 500 }
      );
    }

    let snapshot: LensSnapshot;
    try {
      snapshot = JSON.parse(rawJson) as LensSnapshot;
    } catch (err) {
      return NextResponse.json(
        { error: 'v5.0 engine returned invalid JSON', ticker, rawJson: rawJson.slice(0, 500), errors },
        { status: 500 }
      );
    }

    // Derive legacy scalar fields from dimensions (same as production v5.0 path)
    deriveV5LegacyFields(snapshot);
    snapshot.lensEngineVersion = 'v5.0';

    // Inject identity fields (same as production v5.0 path)
    if (!snapshot.name && identityResult?.identityCard?.legal_name) {
      snapshot.name = identityResult.identityCard.legal_name;
    } else if (!snapshot.name && companyName) {
      snapshot.name = companyName;
    }
    if (!snapshot.ticker) snapshot.ticker = ticker;
    if (!snapshot.id) snapshot.id = ticker.toLowerCase();

    console.log(`[v5-dryrun] Generation OK in ${genMs}ms`);

    // ── Step 6: Persist as test record ─────────────────────────────────────────
    const groundTruthId = groundTruthObject?.groundTruthId ?? null;
    const identityStatus = identityResult?.identityCard?.identity_status ?? null;

    const v5GoverningMechanism =
      snapshot.governingMechanism?.name ??
      (snapshot.governingMechanism as any)?.description ??
      null;
    const v5CoreStructuralProblem = snapshot.coreStructuralProblem ?? null;

    const oid = await saveLensAnalysis(
      snapshot,
      ticker,
      companyName || snapshot.name || ticker,
      exchange || null,
      groundTruthId,
      identityStatus,
      {
        lensEngineVersion: 'v5.0',
        governingMechanism: v5GoverningMechanism,
        coreStructuralProblem: v5CoreStructuralProblem,
        isTestRecord: true,  // ← marks this as a test record — never shown to live users
      },
    );

    console.log(`[v5-dryrun] Persisted test record: OID=${oid} in ${Date.now() - startTime}ms total`);

    return NextResponse.json({
      status: 'SUCCESS',
      ticker,
      oid,
      lensEngineVersion: 'v5.0',
      isTestRecord: true,
      identityStatus,
      groundTruthId,
      groundTruthChars: groundTruth?.length ?? 0,
      retrievedDocCount: retrievalResult?.retrievedDocuments?.length ?? 0,
      generationMs: genMs,
      totalMs: Date.now() - startTime,
      errors,
      snapshot,
    });

  } catch (error) {
    console.error('[v5-dryrun] Unexpected error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'v5-dryrun failed',
        errors,
      },
      { status: 500 }
    );
  }
}
