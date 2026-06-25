import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { assembleGroundTruth, buildGroundTruthPromptContext } from '@/lib/lens/ground-truth';

export const maxDuration = 30;

async function generateGroundTruthId(ticker: string): Promise<string> {
  const year = new Date().getFullYear();
  const tickerUpper = ticker.toUpperCase();

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { count } = await supabase
        .from('lens_ground_truths')
        .select('*', { count: 'exact', head: true })
        .eq('ticker', tickerUpper);
      const sequence = String((count || 0) + 1).padStart(3, '0');
      return `GT-${year}-${tickerUpper}-${sequence}`;
    } catch {
      // Fall through to timestamp-based ID
    }
  }

  // Fallback: use timestamp-based sequence
  const sequence = String(Date.now()).slice(-3);
  return `GT-${year}-${tickerUpper}-${sequence}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticker, companyName, retrievalResult, identityCard } = body as {
      ticker: string;
      companyName: string;
      retrievalResult: any;
      identityCard: any;
    };

    if (!ticker) {
      return NextResponse.json({ error: 'ticker is required' }, { status: 400 });
    }

    const groundTruthId = await generateGroundTruthId(ticker);
    const auditId = retrievalResult?.auditId ?? null;

    const groundTruth = assembleGroundTruth({
      groundTruthId,
      ticker,
      auditId,
      retrievalResult: retrievalResult ?? { retrievedDocuments: [], fmpProfile: {}, tickerNameMatch: true, minimumSourcesMet: false },
      identityCard: identityCard ?? {},
    });

    // Persist to Supabase
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('lens_ground_truths').insert({
          ground_truth_id: groundTruth.groundTruthId,
          ticker: groundTruth.companyIdentity.ticker,
          version: groundTruth.version,
          company_identity: groundTruth.companyIdentity,
          verified_facts: groundTruth.verifiedFacts,
          citations: groundTruth.citations,
          confidence_scores: groundTruth.confidenceScores,
          retrieved_documents: groundTruth.retrievedDocuments,
          identity_status: groundTruth.identityStatus,
          failure_reasons: groundTruth.failureReasons.length > 0 ? groundTruth.failureReasons : null,
          minimum_sources_met: groundTruth.minimumSourcesMet,
          ticker_name_match: groundTruth.tickerNameMatch,
          source_hash: groundTruth.sourceHash,
          audit_id: auditId,
          prompt_version: groundTruth.promptVersion,
          model_version: groundTruth.modelVersion,
          constitution_version: groundTruth.constitutionVersion,
          generated_at: groundTruth.generatedAt,
        });
      } catch (dbErr) {
        console.warn('[ground-truth] DB write failed (non-fatal):', dbErr);
      }
    }

    const promptContext = buildGroundTruthPromptContext(groundTruth);

    return NextResponse.json({
      groundTruth,
      promptContext,
    });
  } catch (err) {
    console.error('[ground-truth] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Ground Truth assembly failed' },
      { status: 500 }
    );
  }
}

// GET: fetch recent GT for a ticker (within 24h)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ticker = searchParams.get('ticker')?.toUpperCase();
  if (!ticker) {
    return NextResponse.json({ error: 'ticker is required' }, { status: 400 });
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ groundTruth: null });
  }

  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('lens_ground_truths')
      .select('*')
      .eq('ticker', ticker)
      .gte('generated_at', cutoff)
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) {
      return NextResponse.json({ groundTruth: null });
    }

    // Reconstruct GroundTruth from DB row
    const gt = {
      groundTruthId: data.ground_truth_id,
      version: data.version,
      generatedAt: data.generated_at,
      companyIdentity: data.company_identity,
      verifiedFacts: data.verified_facts,
      citations: data.citations ?? [],
      confidenceScores: data.confidence_scores,
      retrievedDocuments: data.retrieved_documents ?? [],
      identityStatus: data.identity_status,
      failureReasons: data.failure_reasons ?? [],
      minimumSourcesMet: data.minimum_sources_met,
      tickerNameMatch: data.ticker_name_match,
      sourceHash: data.source_hash,
      auditId: data.audit_id,
      promptVersion: data.prompt_version,
      modelVersion: data.model_version,
      constitutionVersion: data.constitution_version,
    };

    const promptContext = buildGroundTruthPromptContext(gt as any);

    return NextResponse.json({ groundTruth: gt, promptContext });
  } catch (err) {
    console.error('[ground-truth] GET error:', err);
    return NextResponse.json({ groundTruth: null });
  }
}
