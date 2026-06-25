import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export const maxDuration = 30;

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

interface RequiredSources {
  company_profile: boolean;
  financial_data: boolean;
  recent_news_or_earnings: boolean;
  business_description: boolean;
}

async function fmpFetch(path: string): Promise<any> {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch(`${FMP_BASE}${path}&apikey=${apiKey}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticker, companyName, exchange } = body as {
      ticker: string;
      companyName: string;
      exchange?: string;
    };

    if (!ticker || !companyName) {
      return NextResponse.json(
        { error: 'ticker and companyName are required' },
        { status: 400 }
      );
    }

    const tickerUpper = ticker.toUpperCase();

    // ── 2A: Fetch all sources in parallel ──────────────────────────────────
    const [profileData, incomeData, metricsData, newsData] = await Promise.all([
      fmpFetch(`/profile?symbol=${tickerUpper}`),
      fmpFetch(`/income-statement?symbol=${tickerUpper}&period=annual&limit=2`),
      fmpFetch(`/key-metrics?symbol=${tickerUpper}&period=annual&limit=1`),
      fmpFetch(`/stock-news?tickers=${tickerUpper}&limit=5`),
    ]);

    const retrievedDocuments: RetrievedDocument[] = [];

    // Process profile
    const profile = Array.isArray(profileData) ? profileData[0] : profileData;
    const fmpCompanyName: string = profile?.companyName ?? '';
    const fmpExchange: string = profile?.exchangeShortName ?? exchange ?? '';
    const fmpDescription: string = profile?.description ?? '';
    const fmpSector: string = profile?.sector ?? '';
    const fmpIndustry: string = profile?.industry ?? '';
    const fmpWebsite: string = profile?.website ?? '';

    if (profile && fmpCompanyName) {
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

    // Process income statement
    const income = Array.isArray(incomeData) ? incomeData : [];
    if (income.length > 0) {
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

    // Process key metrics
    const metrics = Array.isArray(metricsData) ? metricsData[0] : metricsData;
    if (metrics) {
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

    // Process news
    const news = Array.isArray(newsData) ? newsData.slice(0, 5) : [];
    for (const item of news) {
      if (!item?.title) continue;
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

    // ── 2B: Source classification already done above ────────────────────────

    // ── 2C: Minimum source check ────────────────────────────────────────────
    const requiredSources: RequiredSources = {
      company_profile: retrievedDocuments.some(d => d.source_type === 'company_profile'),
      financial_data: retrievedDocuments.some(d => d.source_type === 'financial_data'),
      recent_news_or_earnings: retrievedDocuments.some(d => d.source_type === 'news' || d.source_type === 'earnings_call'),
      business_description: !!(fmpDescription && fmpDescription.length > 50),
    };

    const minimumSourcesMet = Object.values(requiredSources).every(Boolean);

    // ── 2D: Ticker/name match verification ─────────────────────────────────
    const failureReasons: string[] = [];
    let tickerNameMatch = true;

    if (fmpCompanyName) {
      const fmpFirst = fmpCompanyName.toLowerCase().split(' ')[0];
      const userFirst = companyName.toLowerCase().split(' ')[0];
      tickerNameMatch =
        fmpCompanyName.toLowerCase().includes(userFirst) ||
        companyName.toLowerCase().includes(fmpFirst);

      if (!tickerNameMatch) {
        failureReasons.push(
          `Ticker ${tickerUpper} resolves to "${fmpCompanyName}" but user searched for "${companyName}". Please verify the correct ticker.`
        );
      }
    } else {
      // FMP returned no company name — treat as soft failure
      tickerNameMatch = false;
      failureReasons.push(
        `No company profile found for ticker ${tickerUpper} in FMP. The ticker may be invalid or delisted.`
      );
    }

    if (!minimumSourcesMet) {
      const missing = Object.entries(requiredSources)
        .filter(([, v]) => !v)
        .map(([k]) => k.replace(/_/g, ' '));
      failureReasons.push(`Insufficient source documents. Missing: ${missing.join(', ')}.`);
    }

    const identityStatus = !tickerNameMatch || !minimumSourcesMet ? 'FAIL' : 'PENDING';

    // ── 2E: Store retrieval audit ───────────────────────────────────────────
    let auditId: string | null = null;
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: auditRow } = await supabase
          .from('lens_retrieval_audits')
          .insert({
            ticker: tickerUpper,
            company_name: companyName,
            query_used: `${companyName} (${tickerUpper})`,
            minimum_sources_met: minimumSourcesMet,
            ticker_name_match: tickerNameMatch,
            identity_status: identityStatus,
            failure_reasons: failureReasons.length > 0 ? failureReasons : null,
          })
          .select('id')
          .single();

        if (auditRow?.id) {
          auditId = auditRow.id;
          // Insert retrieved documents
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
      requiredSources,
      failureReasons,
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
      canProceed: minimumSourcesMet && tickerNameMatch,
    });
  } catch (err) {
    console.error('[retrieve] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Retrieval failed' },
      { status: 500 }
    );
  }
}
