import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export const maxDuration = 30;

const IDENTITY_SYSTEM_PROMPT = `You are a company identity verification system. Your sole purpose is to accurately identify and describe the company based ONLY on the provided source documents. You may not use prior knowledge to fill gaps. If a source does not confirm a fact, mark it as unverified.

You must answer seven required identity questions, each citing at least one retrieved source.

Your output determines whether a Lens Analysis™ can proceed. Accuracy is the only objective.

CRITICAL ACCURACY RULES — READ BEFORE GENERATING:
1. If the source documents describe satellite imagery, Earth observation, geospatial intelligence, or space technology, you MUST describe those businesses. Do NOT describe the company as software, CRM, or SaaS unless the source documents explicitly confirm this.
2. If the source documents describe a company in Aerospace & Defense, Industrial, or Hardware sector, do NOT reclassify it as a software or technology services company.
3. The word "cloud-native" in a description refers to the delivery mechanism, NOT the product category. A satellite imagery company that delivers data via a cloud platform is NOT a cloud software company.
4. Read the FMP Sector and Industry fields carefully. Your business_description MUST be consistent with the stated sector and industry.
5. If you are uncertain about the business model, use the FMP description field verbatim as the basis for business_description.

Return ONLY valid JSON. No preamble. No markdown. No explanation outside the JSON object.`;

interface RetrievedDocument {
  source_type: string;
  title: string;
  content?: string;
  url?: string;
}

function buildUserPrompt(
  ticker: string,
  companyName: string,
  fmpProfile: { companyName: string; exchange: string; description: string; sector: string; industry: string },
  retrievedDocuments: RetrievedDocument[]
): string {
  const docList = retrievedDocuments
    .map((d, i) => {
      const content = d.content ? d.content.slice(0, 600) : '(no content)';
      return `[Source ${i + 1}] ${d.source_type.toUpperCase()}: ${d.title}\n${content}`;
    })
    .join('\n\n');

  return `Company ticker: ${ticker}
User-entered name: ${companyName}
FMP registered name: ${fmpProfile.companyName}
Exchange: ${fmpProfile.exchange}
Sector: ${fmpProfile.sector}
Industry: ${fmpProfile.industry}

Source documents provided:
${docList}

Answer these seven required identity questions. For each answer, cite the source by number (e.g. "Source 1").

1. What does this company sell?
2. Who buys it?
3. How does the company make money?
4. What market is it in?
5. What are the current strategic priorities?
6. What are the primary risks?
7. What are the clearest value unlock opportunities?

Then generate a confidence score (0.0-1.0) for how certain you are that your description accurately reflects this specific company based only on the retrieved sources.

Return ONLY valid JSON matching this exact shape:
{
  "ticker": "${ticker}",
  "legal_name": "${fmpProfile.companyName || companyName}",
  "exchange": "${fmpProfile.exchange}",
  "business_description": "2-3 sentences from sources only",
  "products": ["specific products/services cited from sources"],
  "customer_segments": ["specific customer types cited from sources"],
  "revenue_model": ["how they make money — cited from sources"],
  "markets_served": ["specific markets — cited from sources"],
  "strategic_priorities": ["from recent earnings/filings — cited"],
  "primary_risks": ["from recent earnings/filings — cited"],
  "source_citations": ["Source 1", "Source 2"],
  "source_confidence": 0.0,
  "business_description_confidence": 0.0,
  "identity_questions": {
    "what_they_sell": { "answer": "...", "citation": "Source N" },
    "who_buys_it": { "answer": "...", "citation": "Source N" },
    "how_they_make_money": { "answer": "...", "citation": "Source N" },
    "what_market": { "answer": "...", "citation": "Source N" },
    "strategic_priorities": { "answer": "...", "citation": "Source N" },
    "primary_risks": { "answer": "...", "citation": "Source N" },
    "value_unlock_opportunities": { "answer": "...", "citation": "Source N" }
  },
  "identity_status": "PASS",
  "failure_reasons": []
}`;
}

function determineIdentityStatus(
  parsed: any,
  tickerNameMatch: boolean,
  minimumSourcesMet: boolean
): { status: 'PASS' | 'FAIL' | 'NEEDS_REVIEW'; reasons: string[] } {
  const reasons: string[] = [];

  const sourceConf: number = parsed.source_confidence ?? 0;
  const descConf: number = parsed.business_description_confidence ?? 0;

  // Count answered questions
  const questions = parsed.identity_questions ?? {};
  const questionKeys = [
    'what_they_sell', 'who_buys_it', 'how_they_make_money',
    'what_market', 'strategic_priorities', 'primary_risks', 'value_unlock_opportunities'
  ];
  const answeredCount = questionKeys.filter(k => {
    const q = questions[k];
    return q?.answer && q.answer.trim().length > 5 && q.citation;
  }).length;

  if (!tickerNameMatch) {
    reasons.push('Ticker/company name mismatch detected');
  }
  if (!minimumSourcesMet) {
    reasons.push('Insufficient source documents retrieved');
  }
  if (sourceConf < 0.70) {
    reasons.push(`Source confidence too low: ${sourceConf.toFixed(2)} (minimum 0.70)`);
  }
  if (descConf < 0.75) {
    reasons.push(`Business description confidence too low: ${descConf.toFixed(2)} (minimum 0.75)`);
  }
  if (answeredCount < 5) {
    reasons.push(`Only ${answeredCount}/7 identity questions answered (minimum 5)`);
  }

  if (reasons.length > 0) {
    return { status: 'FAIL', reasons };
  }

  // NEEDS_REVIEW thresholds
  if (sourceConf < 0.85 || descConf < 0.90 || answeredCount < 7) {
    return { status: 'NEEDS_REVIEW', reasons: [] };
  }

  return { status: 'PASS', reasons: [] };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      ticker,
      companyName,
      auditId,
      retrievedDocuments,
      fmpProfile,
      tickerNameMatch = true,
      minimumSourcesMet = true,
    } = body as {
      ticker: string;
      companyName: string;
      auditId?: string;
      retrievedDocuments: RetrievedDocument[];
      fmpProfile: { companyName: string; exchange: string; description: string; sector: string; industry: string };
      tickerNameMatch?: boolean;
      minimumSourcesMet?: boolean;
    };

    if (!ticker || !companyName) {
      return NextResponse.json(
        { error: 'ticker and companyName are required' },
        { status: 400 }
      );
    }

    const tickerUpper = ticker.toUpperCase();

    // If retrieval already failed, skip AI and return FAIL immediately
    if (!tickerNameMatch || !minimumSourcesMet) {
      const failReasons: string[] = [];
      if (!tickerNameMatch) {
        failReasons.push(
          `Ticker ${tickerUpper} resolves to "${fmpProfile.companyName}" but user searched for "${companyName}".`
        );
      }
      if (!minimumSourcesMet) {
        failReasons.push('Insufficient source documents retrieved to verify company identity.');
      }
      const failCard = {
        ticker: tickerUpper,
        legal_name: fmpProfile.companyName || companyName,
        exchange: fmpProfile.exchange || '',
        business_description: '',
        products: [],
        customer_segments: [],
        revenue_model: [],
        markets_served: [],
        strategic_priorities: [],
        primary_risks: [],
        source_citations: [],
        source_confidence: 0,
        business_description_confidence: 0,
        identity_questions: {},
        identity_status: 'FAIL' as const,
        failure_reasons: failReasons,
      };
      return NextResponse.json({
        identityCard: failCard,
        canProceed: false,
        needsReview: false,
      });
    }

    // ── Call OpenAI for identity card ───────────────────────────────────────
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const userPrompt = buildUserPrompt(tickerUpper, companyName, fmpProfile, retrievedDocuments);

    const openaiBaseUrl = process.env.OPENAI_API_BASE ?? 'https://api.openai.com/v1';
    const aiRes = await fetch(`${openaiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.1,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: IDENTITY_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!aiRes.ok) {
      throw new Error(`OpenAI error ${aiRes.status}: ${await aiRes.text()}`);
    }

    const aiData = await aiRes.json();
    const rawText = aiData?.choices?.[0]?.message?.content ?? '{}';
    let parsed: any = {};
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = {};
    }

    // ── Determine identity status ───────────────────────────────────────────
    const { status: identityStatus, reasons: failureReasons } = determineIdentityStatus(
      parsed,
      tickerNameMatch,
      minimumSourcesMet
    );

    // Override AI-returned status with our deterministic rules
    parsed.identity_status = identityStatus;
    parsed.failure_reasons = failureReasons.length > 0 ? failureReasons : (parsed.failure_reasons ?? []);

    // ── Ticker override safety net ──────────────────────────────────────────
    // Hard block: if a known non-CRM company gets a CRM description, force FAIL
    const descLower = (parsed.business_description ?? '').toLowerCase();
    const knownNonCrm: Record<string, string> = {
      'PL': 'Planet Labs PBC is an Earth observation and satellite imagery company, not a CRM provider.',
    };
    if (knownNonCrm[tickerUpper] && (descLower.includes('crm') || descLower.includes('customer relationship management'))) {
      parsed.identity_status = 'FAIL';
      parsed.failure_reasons = [
        ...(parsed.failure_reasons ?? []),
        `Business description contains CRM reference for ticker ${tickerUpper} — ${knownNonCrm[tickerUpper]} This indicates a data source error.`,
      ];
      console.warn(`[identity][${tickerUpper}] SAFETY NET triggered: CRM description detected for known non-CRM company`);
    }

    // ── Sector mismatch validation ──────────────────────────────────────────
    // If FMP sector is Aerospace/Defense/Industrial/Hardware but AI describes software/SaaS/CRM, flag NEEDS_REVIEW
    const fmpSectorLower = (fmpProfile.sector ?? '').toLowerCase();
    const fmpIndustryLower = (fmpProfile.industry ?? '').toLowerCase();
    const hardwareSectors = ['aerospace', 'defense', 'industrial', 'energy', 'materials', 'utilities', 'real estate'];
    const softwareTerms = ['software', 'saas', 'crm', 'cloud software', 'platform-as-a-service', 'paas'];
    const isFmpHardwareSector = hardwareSectors.some(s => fmpSectorLower.includes(s) || fmpIndustryLower.includes(s));
    const aiDescribesSoftware = softwareTerms.some(t => descLower.includes(t));
    if (isFmpHardwareSector && aiDescribesSoftware && parsed.identity_status === 'PASS') {
      parsed.identity_status = 'NEEDS_REVIEW';
      console.warn(`[identity][${tickerUpper}] SECTOR MISMATCH: FMP sector="${fmpProfile.sector}" but AI described software/SaaS. Flagging NEEDS_REVIEW.`);
    }

    const identityCard = {
      ticker: tickerUpper,
      legal_name: parsed.legal_name || fmpProfile.companyName || companyName,
      exchange: parsed.exchange || fmpProfile.exchange || '',
      business_description: parsed.business_description || fmpProfile.description || '',
      products: parsed.products ?? [],
      customer_segments: parsed.customer_segments ?? [],
      revenue_model: parsed.revenue_model ?? [],
      markets_served: parsed.markets_served ?? [],
      strategic_priorities: parsed.strategic_priorities ?? [],
      primary_risks: parsed.primary_risks ?? [],
      source_citations: parsed.source_citations ?? [],
      source_confidence: parsed.source_confidence ?? 0,
      business_description_confidence: parsed.business_description_confidence ?? 0,
      identity_questions: parsed.identity_questions ?? {},
      identity_status: identityStatus,
      failure_reasons: parsed.failure_reasons ?? [],
    };

    // ── Persist to Supabase ─────────────────────────────────────────────────
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        // Insert identity card
        await supabase.from('lens_identity_cards').insert({
          audit_id: auditId ?? null,
          ticker: tickerUpper,
          legal_name: identityCard.legal_name,
          exchange: identityCard.exchange,
          business_description: identityCard.business_description,
          products: identityCard.products,
          customer_segments: identityCard.customer_segments,
          revenue_model: identityCard.revenue_model,
          markets_served: identityCard.markets_served,
          strategic_priorities: identityCard.strategic_priorities,
          primary_risks: identityCard.primary_risks,
          source_citations: identityCard.source_citations,
          source_confidence: identityCard.source_confidence,
          identity_status: identityStatus,
          failure_reasons: identityCard.failure_reasons.length > 0 ? identityCard.failure_reasons : null,
        });

        // Update audit row with final status
        if (auditId) {
          await supabase
            .from('lens_retrieval_audits')
            .update({
              identity_status: identityStatus,
              source_confidence: identityCard.source_confidence,
              business_description_confidence: identityCard.business_description_confidence,
              identity_card: identityCard,
              failure_reasons: identityCard.failure_reasons.length > 0 ? identityCard.failure_reasons : null,
            })
            .eq('id', auditId);
        }
      }
    } catch (dbErr) {
      console.warn('[identity] DB write failed (non-fatal):', dbErr);
    }

    return NextResponse.json({
      identityCard,
      canProceed: identityStatus === 'PASS',
      needsReview: identityStatus === 'NEEDS_REVIEW',
    });
  } catch (err) {
    console.error('[identity] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Identity verification failed' },
      { status: 500 }
    );
  }
}
