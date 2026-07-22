import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export const maxDuration = 45;

const FMP_BASE = 'https://financialmodelingprep.com/stable';

interface RetrievedDocument {
  source_type: string;
  title: string;
  url: string;
  relevance_score: number;
  tokens_used: number;
  included_in_prompt: boolean;
  excluded_reason: string | null;
  content?: string;
}

interface RetrievalChecklist {
  company_profile: boolean;
  financial_data: boolean;
  sec_filing: boolean;
  earnings_or_transcript: boolean;
  recent_news: boolean;
  business_description: boolean;
}

async function fmpFetch(path: string, label: string, ticker: string, isDiag: boolean): Promise<any> {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    if (isDiag) console.log(`[retrieve][${ticker}] DIAG: ${label} — no FMP_API_KEY`);
    return null;
  }
  try {
    const url = `${FMP_BASE}${path}&apikey=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (isDiag) console.log(`[retrieve][${ticker}] DIAG: ${label} — status ${res.status}`);
    if (!res.ok) return null;
    const data = await res.json();
    // FMP sometimes returns {"Error Message": "..."} or empty array
    if (data && typeof data === 'object' && !Array.isArray(data) && data['Error Message']) {
      if (isDiag) console.log(`[retrieve][${ticker}] DIAG: ${label} — FMP error: ${data['Error Message']}`);
      return null;
    }
    if (Array.isArray(data) && data.length === 0) {
      if (isDiag) console.log(`[retrieve][${ticker}] DIAG: ${label} — empty array returned`);
      return null;
    }
    if (isDiag) console.log(`[retrieve][${ticker}] DIAG: ${label} — OK, ${Array.isArray(data) ? data.length + ' items' : 'object'}`);
    return data;
  } catch (e) {
    if (isDiag) console.log(`[retrieve][${ticker}] DIAG: ${label} — exception: ${e}`);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticker, companyName, exchange, retryMode } = body as {
      ticker: string;
      companyName: string;
      exchange?: string;
      retryMode?: boolean;
    };

    if (!ticker || !companyName) {
      return NextResponse.json(
        { error: 'ticker and companyName are required' },
        { status: 400 }
      );
    }

    const tickerUpper = ticker.toUpperCase();
    // Diagnostic logging always on for now (non-PII, helps debug)
    const isDiag = true;

    if (isDiag) console.log(`[retrieve][${tickerUpper}] START — company="${companyName}" exchange="${exchange ?? 'N/A'}" retryMode=${!!retryMode}`);

    // ── Fetch all sources in parallel ─────────────────────────────────────────
    const [
      profileData,
      incomeData,
      metricsData,
      newsData,
      secFilingsData,
      earningsData,
      transcriptData,
      executivesData,
      outlookData,
    ] = await Promise.all([
      fmpFetch(`/profile?symbol=${tickerUpper}`, 'profile', tickerUpper, isDiag),
      fmpFetch(`/income-statement?symbol=${tickerUpper}&period=annual&limit=2`, 'income-statement', tickerUpper, isDiag),
      fmpFetch(`/key-metrics?symbol=${tickerUpper}&period=annual&limit=1`, 'key-metrics', tickerUpper, isDiag),
      fmpFetch(`/stock-news?tickers=${tickerUpper}&limit=10`, 'stock-news', tickerUpper, isDiag),
      fmpFetch(`/sec-filings?symbol=${tickerUpper}&type=10-K&limit=1`, 'sec-filings-10K', tickerUpper, isDiag),
      fmpFetch(`/earnings?symbol=${tickerUpper}&limit=4`, 'earnings', tickerUpper, isDiag),
      fmpFetch(`/earning-call-transcript?symbol=${tickerUpper}&limit=1`, 'earnings-transcript', tickerUpper, isDiag),
      fmpFetch(`/key-executives?symbol=${tickerUpper}`, 'key-executives', tickerUpper, isDiag),
      fmpFetch(`/company-outlook?symbol=${tickerUpper}`, 'company-outlook', tickerUpper, isDiag),
    ]);

    const retrievedDocuments: RetrievedDocument[] = [];

    // ── Process profile ────────────────────────────────────────────────────────
    const profile = Array.isArray(profileData) ? profileData[0] : profileData;
    // Also check company-outlook for profile data as fallback
    const outlookProfile = outlookData?.profile ?? null;
    const effectiveProfile = profile ?? outlookProfile;

    const fmpCompanyName: string = effectiveProfile?.companyName ?? '';
    const fmpExchange: string = effectiveProfile?.exchangeShortName ?? exchange ?? '';
    const fmpDescription: string = effectiveProfile?.description ?? outlookData?.profile?.description ?? '';
    const fmpSector: string = effectiveProfile?.sector ?? '';
    const fmpIndustry: string = effectiveProfile?.industry ?? '';
    const fmpWebsite: string = effectiveProfile?.website ?? '';

    const company_profile_found = !!(effectiveProfile && fmpCompanyName);

    if (company_profile_found) {
      retrievedDocuments.push({
        source_type: 'company_profile',
        title: `${fmpCompanyName} — Company Profile (FMP)`,
        url: `https://financialmodelingprep.com/financial-summary/${tickerUpper}`,
        relevance_score: 1.0,
        tokens_used: Math.ceil((fmpDescription?.length ?? 0) / 4),
        included_in_prompt: true,
        excluded_reason: null,
        content: [
          `Company: ${fmpCompanyName}`,
          `Exchange: ${fmpExchange}`,
          `Sector: ${fmpSector}`,
          `Industry: ${fmpIndustry}`,
          `Website: ${fmpWebsite}`,
          `Description: ${fmpDescription}`,
        ].join('\n'),
      });
    }

    // ── Process income statement ───────────────────────────────────────────────
    const income = Array.isArray(incomeData) ? incomeData : [];
    let financial_data_found = false;
    if (income.length > 0) {
      financial_data_found = true;
      const latest = income[0];
      const content = [
        `Revenue (latest): $${((latest.revenue ?? 0) / 1e9).toFixed(2)}B`,
        `Gross Profit: $${((latest.grossProfit ?? 0) / 1e9).toFixed(2)}B`,
        `Operating Income: $${((latest.operatingIncome ?? 0) / 1e9).toFixed(2)}B`,
        `Net Income: $${((latest.netIncome ?? 0) / 1e9).toFixed(2)}B`,
        `Period: ${latest.date ?? 'N/A'}`,
      ].join('\n');
      retrievedDocuments.push({
        source_type: 'financial_data',
        title: `${fmpCompanyName || tickerUpper} — Income Statement (FMP)`,
        url: `https://financialmodelingprep.com/financial-statements/${tickerUpper}`,
        relevance_score: 0.9,
        tokens_used: Math.ceil(content.length / 4),
        included_in_prompt: true,
        excluded_reason: null,
        content,
      });
    }

    // ── Process key metrics ────────────────────────────────────────────────────
    const metrics = Array.isArray(metricsData) ? metricsData[0] : metricsData;
    if (metrics) {
      financial_data_found = true;
      const content = [
        `Market Cap: $${((metrics.marketCap ?? 0) / 1e9).toFixed(2)}B`,
        `P/E Ratio: ${metrics.peRatio ?? 'N/A'}`,
        `Revenue Per Share: ${metrics.revenuePerShare ?? 'N/A'}`,
        `Free Cash Flow Yield: ${metrics.freeCashFlowYield ?? 'N/A'}`,
        `Debt to Equity: ${metrics.debtToEquity ?? 'N/A'}`,
      ].join('\n');
      retrievedDocuments.push({
        source_type: 'financial_data',
        title: `${fmpCompanyName || tickerUpper} — Key Metrics (FMP)`,
        url: `https://financialmodelingprep.com/financial-summary/${tickerUpper}`,
        relevance_score: 0.85,
        tokens_used: Math.ceil(content.length / 4),
        included_in_prompt: true,
        excluded_reason: null,
        content,
      });
    }

    // ── Process news ───────────────────────────────────────────────────────────
    const news = Array.isArray(newsData) ? newsData.slice(0, 10) : [];
    let recent_news_found = false;
    for (const item of news) {
      if (!item?.title) continue;
      recent_news_found = true;
      retrievedDocuments.push({
        source_type: 'news',
        title: item.title,
        url: item.url ?? '',
        relevance_score: 0.7,
        tokens_used: Math.ceil((item.text?.length ?? item.title?.length ?? 0) / 4),
        included_in_prompt: true,
        excluded_reason: null,
        content: item.text ? item.text.slice(0, 500) : item.title,
      });
    }

    // ── Process SEC filings ────────────────────────────────────────────────────
    const secFilings = Array.isArray(secFilingsData) ? secFilingsData : [];
    let sec_filing_found = false;
    if (secFilings.length > 0) {
      sec_filing_found = true;
      const filing = secFilings[0];
      const content = [
        `Filing Type: ${filing.type ?? '10-K'}`,
        `Filing Date: ${filing.fillingDate ?? filing.date ?? 'N/A'}`,
        `Description: ${filing.description ?? 'Annual Report filed with SEC'}`,
        `Link: ${filing.link ?? filing.finalLink ?? 'N/A'}`,
      ].join('\n');
      retrievedDocuments.push({
        source_type: '10-K',
        title: `${fmpCompanyName || tickerUpper} — SEC 10-K Filing`,
        url: filing.link ?? filing.finalLink ?? `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&company=${tickerUpper}`,
        relevance_score: 0.95,
        tokens_used: Math.ceil(content.length / 4),
        included_in_prompt: true,
        excluded_reason: null,
        content,
      });
    }

    // ── Process earnings history ───────────────────────────────────────────────
    const earnings = Array.isArray(earningsData) ? earningsData : [];
    let earnings_found = false;
    if (earnings.length > 0) {
      earnings_found = true;
      const latest = earnings[0];
      const content = [
        `Date: ${latest.date ?? 'N/A'}`,
        `EPS Estimate: ${latest.epsEstimated ?? 'N/A'}`,
        `EPS Actual: ${latest.eps ?? 'N/A'}`,
        `Revenue Estimate: ${latest.revenueEstimated ? `$${(latest.revenueEstimated / 1e9).toFixed(2)}B` : 'N/A'}`,
        `Revenue Actual: ${latest.revenue ? `$${(latest.revenue / 1e9).toFixed(2)}B` : 'N/A'}`,
      ].join('\n');
      retrievedDocuments.push({
        source_type: 'earnings_release',
        title: `${fmpCompanyName || tickerUpper} — Earnings History (FMP)`,
        url: `https://financialmodelingprep.com/financial-summary/${tickerUpper}`,
        relevance_score: 0.88,
        tokens_used: Math.ceil(content.length / 4),
        included_in_prompt: true,
        excluded_reason: null,
        content,
      });
    }

    // ── Process earnings transcript ────────────────────────────────────────────
    const transcripts = Array.isArray(transcriptData) ? transcriptData : [];
    let transcript_found = false;
    if (transcripts.length > 0) {
      transcript_found = true;
      const t = transcripts[0];
      const content = (t.content ?? t.transcript ?? '').slice(0, 1000);
      retrievedDocuments.push({
        source_type: 'earnings_call',
        title: `${fmpCompanyName || tickerUpper} — Earnings Call Transcript`,
        url: `https://financialmodelingprep.com/financial-summary/${tickerUpper}`,
        relevance_score: 0.92,
        tokens_used: Math.ceil(content.length / 4),
        included_in_prompt: true,
        excluded_reason: null,
        content,
      });
    } else {
      if (isDiag) console.log(`[retrieve][${tickerUpper}] DIAG: transcript endpoint returned no data (may be plan limitation)`);
    }

    // ── Process key executives ─────────────────────────────────────────────────
    const executives = Array.isArray(executivesData) ? executivesData : [];
    if (executives.length > 0) {
      const ceo = executives.find((e: any) => (e.title ?? '').toLowerCase().includes('ceo') || (e.title ?? '').toLowerCase().includes('chief executive'));
      const content = executives.slice(0, 5).map((e: any) => `${e.name ?? 'N/A'} — ${e.title ?? 'N/A'}`).join('\n');
      retrievedDocuments.push({
        source_type: 'executives',
        title: `${fmpCompanyName || tickerUpper} — Key Executives`,
        url: `https://financialmodelingprep.com/financial-summary/${tickerUpper}`,
        relevance_score: 0.75,
        tokens_used: Math.ceil(content.length / 4),
        included_in_prompt: true,
        excluded_reason: null,
        content: ceo ? `CEO: ${ceo.name}\n${content}` : content,
      });
    }

    // ── Process company outlook ────────────────────────────────────────────────
    if (outlookData && (outlookData.profile || outlookData.financialsAnnual)) {
      const content = [
        outlookData.profile?.description ? `Description: ${outlookData.profile.description.slice(0, 400)}` : '',
        outlookData.profile?.ceo ? `CEO: ${outlookData.profile.ceo}` : '',
        outlookData.profile?.fullTimeEmployees ? `Employees: ${outlookData.profile.fullTimeEmployees}` : '',
        outlookData.profile?.ipoDate ? `IPO Date: ${outlookData.profile.ipoDate}` : '',
      ].filter(Boolean).join('\n');
      if (content) {
        retrievedDocuments.push({
          source_type: 'comprehensive_profile',
          title: `${fmpCompanyName || tickerUpper} — Company Outlook (FMP)`,
          url: `https://financialmodelingprep.com/financial-summary/${tickerUpper}`,
          relevance_score: 0.95,
          tokens_used: Math.ceil(content.length / 4),
          included_in_prompt: true,
          excluded_reason: null,
          content,
        });
        // If no description from profile, use outlook description
        if (!fmpDescription && outlookData.profile?.description) {
          // Update business_description_found
        }
      }
    }

    // ── Improved search query ──────────────────────────────────────────────────
    const exchangeLabel = fmpExchange || exchange || '';
    const searchQuery = retryMode
      ? `"${companyName}" ${tickerUpper} ${exchangeLabel} annual report investor relations SEC 10-K earnings site:sec.gov OR site:ir.${fmpWebsite?.replace('https://', '').replace('http://', '').split('/')[0] ?? ''}`
      : `${companyName} ${tickerUpper} ${exchangeLabel} annual report investor relations SEC 10-K earnings`;

    if (isDiag) console.log(`[retrieve][${tickerUpper}] DIAG: searchQuery="${searchQuery}"`);

    // ── Retrieval checklist ────────────────────────────────────────────────────
    const business_description_found = !!(fmpDescription && fmpDescription.length > 50) ||
      !!(outlookData?.profile?.description && outlookData.profile.description.length > 50);

    const retrievalChecklist: RetrievalChecklist = {
      company_profile: company_profile_found,
      financial_data: financial_data_found,
      sec_filing: sec_filing_found,
      earnings_or_transcript: earnings_found || transcript_found,
      recent_news: recent_news_found,
      business_description: business_description_found,
    };

    if (isDiag) {
      console.log(`[retrieve][${tickerUpper}] DIAG: retrievalChecklist:`, JSON.stringify(retrievalChecklist));
    }

    // ── Updated minimum source requirements ───────────────────────────────────
    // FAIL only for true identity failures, not retrieval limitations
    // minimumSourcesMet = true if ANY THREE of these five signals are present
    // (more realistic given FMP plan limitations — previously required all three groups)
    const sourceSignals = [
      company_profile_found,
      financial_data_found,
      sec_filing_found || earnings_found,
      business_description_found,
      !!(outlookData?.profile),
    ];
    const minimumSourcesMet = sourceSignals.filter(Boolean).length >= 3;

    if (isDiag) {
      console.log(`[retrieve][${tickerUpper}] DIAG: minimumSourcesMet=${minimumSourcesMet} (profile=${company_profile_found}, financial=${financial_data_found}, earnings=${earnings_found}, transcript=${transcript_found}, news=${recent_news_found})`);
    }

    // ── Ticker/name match verification ────────────────────────────────────────
    const failureReasons: string[] = [];
    let tickerNameMatch = true;

    // Normalize accents for comparison (e.g. "Nestlé" == "Nestle")
    const stripAccents = (s: string) =>
      s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (fmpCompanyName) {
      const fmpNorm = stripAccents(fmpCompanyName.toLowerCase());
      const userNorm = stripAccents(companyName.toLowerCase());
      const fmpFirst = fmpNorm.split(' ')[0];
      const userFirst = userNorm.split(' ')[0];
      tickerNameMatch =
        fmpNorm.includes(userFirst) ||
        userNorm.includes(fmpFirst);

      if (!tickerNameMatch) {
        failureReasons.push(
          `Ticker ${tickerUpper} resolves to "${fmpCompanyName}" but user searched for "${companyName}". Please verify the correct ticker.`
        );
      }
    } else {
      tickerNameMatch = false;
      failureReasons.push(
        `No company profile found for ticker ${tickerUpper} in FMP. The ticker may be invalid or delisted.`
      );
    }

    if (!minimumSourcesMet) {
      const missing = Object.entries(retrievalChecklist)
        .filter(([, v]) => !v)
        .map(([k]) => k.replace(/_/g, ' '));
      failureReasons.push(`Insufficient source documents. Missing: ${missing.join(', ')}.`);
    }

    // ── Failure mode classification ────────────────────────────────────────────
    let failureMode: null | 'COMPANY_VERIFICATION' | 'RETRIEVAL_VERIFICATION' = null;

    if (!tickerNameMatch || !company_profile_found) {
      // True identity failure — wrong ticker or FMP doesn't recognize it
      failureMode = 'COMPANY_VERIFICATION';
    } else if (tickerNameMatch && company_profile_found && !minimumSourcesMet) {
      // Correct company, correct ticker, but retrieval pipeline couldn't get enough sources
      failureMode = 'RETRIEVAL_VERIFICATION';
    }

    const canProceed = minimumSourcesMet && tickerNameMatch;
    const identityStatus = !tickerNameMatch || !company_profile_found ? 'FAIL' :
      !minimumSourcesMet ? 'FAIL' : 'PENDING';

    if (isDiag) {
      console.log(`[retrieve][${tickerUpper}] DIAG: failureMode=${failureMode} canProceed=${canProceed} identityStatus=${identityStatus}`);
    }

    // ── Store retrieval audit ──────────────────────────────────────────────────
    let auditId: string | null = null;
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: auditRow } = await supabase
          .from('lens_retrieval_audits')
          .insert({
            ticker: tickerUpper,
            company_name: companyName,
            query_used: searchQuery,
            minimum_sources_met: minimumSourcesMet,
            ticker_name_match: tickerNameMatch,
            identity_status: identityStatus,
            failure_reasons: failureReasons.length > 0 ? failureReasons : null,
          })
          .select('id')
          .single();

        if (auditRow?.id) {
          auditId = auditRow.id;
          const docRows = retrievedDocuments.map(d => ({
            audit_id: auditId,
            ticker: tickerUpper,
            source_type: d.source_type,
            title: d.title,
            url: d.url,
            relevance_score: d.relevance_score,
            tokens_used: d.tokens_used,
            included_in_prompt: d.included_in_prompt,
            excluded_reason: d.excluded_reason,
          }));
          await supabase.from('lens_retrieved_documents').insert(docRows);
        }
      }
    } catch (dbErr) {
      console.warn('[retrieve] DB write failed (non-fatal):', dbErr);
    }

    return NextResponse.json({
      auditId,
      retrievedDocuments,
      minimumSourcesMet,
      tickerNameMatch,
      requiredSources: retrievalChecklist,
      retrievalChecklist,
      failureMode,
      failureReasons,
      companyIdentifiedAs: fmpCompanyName || null,
      canProceed,
      searchQuery,
      retryMode: !!retryMode,
      fmpProfile: {
        companyName: fmpCompanyName,
        exchange: fmpExchange,
        description: fmpDescription,
        sector: fmpSector,
        industry: fmpIndustry,
        website: fmpWebsite,
      },
      financialData: {
        income: income.slice(0, 2),
        metrics,
      },
      recentNews: news,
    });
  } catch (err) {
    console.error('[retrieve] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Retrieval failed' },
      { status: 500 }
    );
  }
}
