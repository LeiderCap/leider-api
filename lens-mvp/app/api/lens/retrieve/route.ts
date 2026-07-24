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
    // Always log non-200 responses — never silently treat failures as "no data"
    if (!res.ok) {
      console.warn(`[retrieve][${ticker}] WARN: ${label} — HTTP ${res.status} (non-200). This is a FAILURE, not "no data". Path: ${path.split('?')[0]}`);
      if (isDiag) {
        const errBody = await res.text().catch(() => '');
        console.log(`[retrieve][${ticker}] DIAG: ${label} — error body: ${errBody.slice(0, 200)}`);
      }
      return null;
    }
    if (isDiag) console.log(`[retrieve][${ticker}] DIAG: ${label} — status ${res.status}`);
    const data = await res.json();
    // FMP sometimes returns {"Error Message": "..."} or empty array
    if (data && typeof data === 'object' && !Array.isArray(data) && data['Error Message']) {
      console.warn(`[retrieve][${ticker}] WARN: ${label} — FMP error message: ${data['Error Message']}`);
      return null;
    }
    if (Array.isArray(data) && data.length === 0) {
      // HTTP 200 + empty array = FMP confirmed no data exists (genuine empty, not a failure)
      if (isDiag) console.log(`[retrieve][${ticker}] DIAG: ${label} — HTTP 200 empty array (FMP confirmed: no data for this ticker)`);
      return null;
    }
    if (isDiag) console.log(`[retrieve][${ticker}] DIAG: ${label} — OK, ${Array.isArray(data) ? data.length + ' items' : 'object'}`);
    return data;
  } catch (e) {
    console.warn(`[retrieve][${ticker}] WARN: ${label} — exception: ${e}`);
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
      secFilingsOlderData,
      earningsData,
      transcriptData,
      executivesData,
      outlookData,
    ] = await Promise.all([
      fmpFetch(`/profile?symbol=${tickerUpper}`, 'profile', tickerUpper, isDiag),
      fmpFetch(`/income-statement?symbol=${tickerUpper}&period=annual&limit=2`, 'income-statement', tickerUpper, isDiag),
      fmpFetch(`/key-metrics?symbol=${tickerUpper}&period=annual&limit=1`, 'key-metrics', tickerUpper, isDiag),
      fmpFetch(`/news/stock?symbols=${tickerUpper}&limit=10`, 'stock-news', tickerUpper, isDiag),
      // Primary: most recent 100 filings (all types, filtered to 8-K in processing)
      fmpFetch(`/sec-filings-search/symbol?symbol=${tickerUpper}&formType=8-K&from=2020-01-01&to=2026-12-31&limit=100`, 'sec-filings-8K', tickerUpper, isDiag),
      // Supplemental: 8-K-only query for 2024-2025 to catch deal announcements that
      // get crowded out of the primary query by high-volume non-8-K filings (SC TO-T/A,
      // Form 4s, etc.) during tender offer periods
      fmpFetch(`/sec-filings-search/symbol?symbol=${tickerUpper}&formType=8-K&from=2024-01-01&to=2025-04-30&limit=50`, 'sec-filings-8K-older', tickerUpper, isDiag),
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

    // ── Process SEC filings (8-K) — materiality-aware selection ─────────────
    // Strategy: widen the historical window, score each 8-K for M&A/strategic
    // materiality by fetching the filing body and keyword-matching, then select
    // the top material filings + the 2 most recent regardless of materiality.
    // Merge primary + supplemental 8-K results, dedup by link
    const secFilingsPrimary = Array.isArray(secFilingsData) ? secFilingsData : [];
    const secFilingsOlder = Array.isArray(secFilingsOlderData) ? secFilingsOlderData : [];
    const secFilingsSeenLinks = new Set<string>();
    const secFilings: any[] = [];
    for (const f of [...secFilingsPrimary, ...secFilingsOlder]) {
      const key = f.link ?? f.finalLink ?? '';
      if (key && !secFilingsSeenLinks.has(key)) {
        secFilingsSeenLinks.add(key);
        secFilings.push(f);
      }
    }
    if (isDiag) console.log(`[retrieve][${tickerUpper}] DIAG: sec-filings merged: ${secFilingsPrimary.length} primary + ${secFilingsOlder.length} supplemental = ${secFilings.length} unique`);
    let sec_filing_found = false;

    // High-signal M&A keywords — presence of ANY of these indicates a material
    // strategic event (acquisition, merger, change of control, tender offer).
    // Deliberately excludes 'definitive agreement' alone (too common as boilerplate
    // in Item 1.01 credit amendments).
    const MATERIAL_8K_KEYWORDS = [
      'acquisition', 'merger', 'tender offer', 'transaction agreement',
      'completion of acquisition', 'item 2.01', 'item 5.01',
      'change of control', 'squeeze-out', 'business combination', 'takeover',
    ];

    /**
     * Fetch the main 8-K body document from an SEC index page URL and
     * return the plain-text content (lowercased) for keyword matching.
     * Returns null on any fetch/parse failure (non-fatal).
     */
    async function fetch8KBodyText(indexUrl: string): Promise<string | null> {
      try {
        const idxRes = await fetch(indexUrl, {
          headers: { 'User-Agent': 'LensAnalysis research@lensanalysis.com' },
          signal: AbortSignal.timeout(6000),
        });
        if (!idxRes.ok) return null;
        const idxHtml = await idxRes.text();
        // Extract main 8-K body URL from the index page
        // iXBRL viewer links: /ix?doc=/Archives/edgar/.../file.htm
        const ixMatch = idxHtml.match(/\/ix\?doc=(\/Archives\/edgar\/[^"'\s]+\.htm)/i);
        if (ixMatch) {
          const bodyUrl = `https://www.sec.gov${ixMatch[1]}`;
          const bodyRes = await fetch(bodyUrl, {
            headers: { 'User-Agent': 'LensAnalysis research@lensanalysis.com' },
            signal: AbortSignal.timeout(8000),
          });
          if (!bodyRes.ok) return null;
          const bodyHtml = await bodyRes.text();
          // Strip HTML tags for plain text
          return bodyHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').toLowerCase();
        }
        return null;
      } catch {
        return null;
      }
    }

    if (secFilings.length > 0) {
      sec_filing_found = true;

      // Filter to only true 8-K filings (exclude SC 13G/A, Form 4, 10-Q, etc.)
      const only8Ks = secFilings.filter((f: any) =>
        (f.formType ?? f.type ?? '').toUpperCase() === '8-K'
      );

      if (isDiag) console.log(`[retrieve][${tickerUpper}] DIAG: sec-filings — ${secFilings.length} total, ${only8Ks.length} pure 8-Ks`);

      // Score each 8-K for materiality (fetch body in parallel, cap at 20 to
      // avoid excessive latency — the most recent 20 8-Ks cover ~3–5 years for
      // most companies and include any major M&A events in that window)
      const candidateFilings = only8Ks.slice(0, 30);
      const bodyTexts = await Promise.all(
        candidateFilings.map((f: any) =>
          fetch8KBodyText(f.link ?? f.finalLink ?? '')
        )
      );

      const scoredFilings = candidateFilings.map((f: any, i: number) => {
        const text = bodyTexts[i] ?? '';
        const matchedKeywords = MATERIAL_8K_KEYWORDS.filter(kw => text.includes(kw));
        const materialityScore = matchedKeywords.length;
        // Extract a ~450-char body excerpt for material filings.
        // Strategy: find the first Item header (e.g. "Item 1.01") or first
        // substantive keyword, then take 450 chars from that point.
        // This excerpt is stored and injected into the prompt context so the
        // model has actual deal facts, not just a filing link.
        let bodyExcerpt: string | null = null;
        if (materialityScore >= 1 && text.length > 0) {
          // Excerpt strategy: two windows concatenated with ellipsis.
          // Window 1 (~300 chars): opening paragraph — captures counterparty name,
          //   transaction type, and deal structure from the first Item header.
          // Window 2 (~200 chars): price/financing paragraph — captures deal price
          //   and financing terms (e.g. "$7.50", "bridge loan") from a later paragraph.
          const EXCERPT_ANCHORS = ['item 1.01', 'item 2.01', 'item 5.01', 'entered into', 'transaction agreement', 'acquisition'];
          let excerptStart = -1;
          for (const anchor of EXCERPT_ANCHORS) {
            const idx = text.indexOf(anchor);
            if (idx >= 0) { excerptStart = idx; break; }
          }
          if (excerptStart < 0) excerptStart = 0;
          const window1 = text.slice(excerptStart, excerptStart + 300).trim();
          // Window 2: find a price/financing anchor in the full text
          const PRICE_ANCHORS = ['$', '\u20ac', 'per share', 'bridge loan', 'financing', 'consideration'];
          let priceStart = -1;
          for (const anchor of PRICE_ANCHORS) {
            const idx = text.indexOf(anchor, excerptStart + 300);
            if (idx >= 0) { priceStart = idx; break; }
          }
          const window2 = priceStart >= 0 ? text.slice(priceStart, priceStart + 200).trim() : '';
          bodyExcerpt = window2 ? window1 + ' [...] ' + window2 : window1;
        }
        return { filing: f, materialityScore, matchedKeywords, bodyExcerpt };
      });

      if (isDiag) {
        scoredFilings.forEach(({ filing, materialityScore, matchedKeywords }) => {
          const date = (filing.filingDate ?? filing.date ?? '?').slice(0, 10);
          console.log(`[retrieve][${tickerUpper}] DIAG: 8-K ${date} score=${materialityScore} keywords=[${matchedKeywords.join(',')}]`);
        });
      }

      // Select: top material filings (score >= 1) sorted by score desc, then
      // fill remaining slots with the 2 most recent filings regardless of score.
      // Total cap: 5 filings to keep prompt size bounded.
      const materialScoredFilings = scoredFilings
        .filter(s => s.materialityScore >= 1)
        .sort((a, b) => b.materialityScore - a.materialityScore)
        .slice(0, 3);
      const materialFilings = materialScoredFilings.map(s => s.filing);
      // Build a map of link -> bodyExcerpt for the 3 material filings
      const materialExcerptMap = new Map<string, string>();
      for (const s of materialScoredFilings) {
        const key = s.filing.link ?? s.filing.finalLink ?? '';
        if (key && s.bodyExcerpt) materialExcerptMap.set(key, s.bodyExcerpt);
      }

      const recentFilings = candidateFilings.slice(0, 2);

      // Merge: material first, then recent, dedup by link
      const seenLinks = new Set<string>();
      const selectedFilings: any[] = [];
      for (const f of [...materialFilings, ...recentFilings]) {
        const key = f.link ?? f.finalLink ?? '';
        if (!seenLinks.has(key)) {
          seenLinks.add(key);
          selectedFilings.push(f);
        }
        if (selectedFilings.length >= 5) break;
      }

      if (isDiag) console.log(`[retrieve][${tickerUpper}] DIAG: selected ${selectedFilings.length} 8-Ks (${materialFilings.length} material + recent fill)`);

      const content = selectedFilings.map((filing: any) => {
        const link = filing.link ?? filing.finalLink ?? 'N/A';
        const excerpt = materialExcerptMap.get(link);
        const lines = [
          `Filing Type: ${filing.formType ?? filing.type ?? '8-K'}`,
          `Filing Date: ${filing.filingDate ?? filing.fillingDate ?? filing.date ?? 'N/A'}`,
          `Link: ${link}`,
        ];
        if (excerpt) {
          lines.push(`Key Facts (excerpt): ${excerpt}`);
        }
        return lines.join('\n');
      }).join('\n---\n');

      retrievedDocuments.push({
        source_type: 'sec_filing',
        title: `${fmpCompanyName || tickerUpper} — SEC 8-K Filings (Material + Recent)`,
        url: selectedFilings[0]?.link ?? selectedFilings[0]?.finalLink ?? `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&company=${tickerUpper}`,
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
