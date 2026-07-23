// Well-known foreign companies and their US ADR tickers
// Format: { searchTerms: string[], adrTicker: string, exchange: string, primaryExchange: string, companyName: string }
// Used by the company-search API to surface foreign companies via their US ADR listings.

export const ADR_MAPPING = [
  // Swiss companies
  { searchTerms: ['nestle', 'nestlé', 'nestle sa', 'nestlé s.a'], adrTicker: 'NSRGY', exchange: 'OTC', primaryExchange: 'SIX', companyName: 'Nestlé S.A.' },
  { searchTerms: ['novartis'], adrTicker: 'NVS', exchange: 'NYSE', primaryExchange: 'SIX', companyName: 'Novartis AG' },
  { searchTerms: ['roche', 'roche holding'], adrTicker: 'RHHBY', exchange: 'OTC', primaryExchange: 'SIX', companyName: 'Roche Holding AG' },
  { searchTerms: ['ubs'], adrTicker: 'UBS', exchange: 'NYSE', primaryExchange: 'SIX', companyName: 'UBS Group AG' },
  // UK companies
  { searchTerms: ['unilever'], adrTicker: 'UL', exchange: 'NYSE', primaryExchange: 'LSE', companyName: 'Unilever PLC' },
  { searchTerms: ['bp', 'british petroleum'], adrTicker: 'BP', exchange: 'NYSE', primaryExchange: 'LSE', companyName: 'BP p.l.c.' },
  { searchTerms: ['shell', 'royal dutch shell'], adrTicker: 'SHEL', exchange: 'NYSE', primaryExchange: 'LSE', companyName: 'Shell plc' },
  { searchTerms: ['astrazeneca', 'astra zeneca'], adrTicker: 'AZN', exchange: 'NASDAQ', primaryExchange: 'LSE', companyName: 'AstraZeneca PLC' },
  { searchTerms: ['diageo'], adrTicker: 'DEO', exchange: 'NYSE', primaryExchange: 'LSE', companyName: 'Diageo plc' },
  { searchTerms: ['hsbc'], adrTicker: 'HSBC', exchange: 'NYSE', primaryExchange: 'LSE', companyName: 'HSBC Holdings plc' },
  { searchTerms: ['glaxosmithkline', 'gsk'], adrTicker: 'GSK', exchange: 'NYSE', primaryExchange: 'LSE', companyName: 'GSK plc' },
  // German companies
  { searchTerms: ['siemens'], adrTicker: 'SIEGY', exchange: 'OTC', primaryExchange: 'XETRA', companyName: 'Siemens AG' },
  { searchTerms: ['volkswagen', 'vw'], adrTicker: 'VWAGY', exchange: 'OTC', primaryExchange: 'XETRA', companyName: 'Volkswagen AG' },
  { searchTerms: ['bayer'], adrTicker: 'BAYRY', exchange: 'OTC', primaryExchange: 'XETRA', companyName: 'Bayer AG' },
  { searchTerms: ['basf'], adrTicker: 'BASFY', exchange: 'OTC', primaryExchange: 'XETRA', companyName: 'BASF SE' },
  { searchTerms: ['sap'], adrTicker: 'SAP', exchange: 'NYSE', primaryExchange: 'XETRA', companyName: 'SAP SE' },
  { searchTerms: ['allianz'], adrTicker: 'ALIZY', exchange: 'OTC', primaryExchange: 'XETRA', companyName: 'Allianz SE' },
  // French companies
  { searchTerms: ['lvmh', 'louis vuitton'], adrTicker: 'LVMUY', exchange: 'OTC', primaryExchange: 'EPA', companyName: 'LVMH Moët Hennessy' },
  { searchTerms: ['total', 'totalenergies'], adrTicker: 'TTE', exchange: 'NYSE', primaryExchange: 'EPA', companyName: 'TotalEnergies SE' },
  { searchTerms: ['sanofi'], adrTicker: 'SNY', exchange: 'NASDAQ', primaryExchange: 'EPA', companyName: 'Sanofi' },
  { searchTerms: ['airbus'], adrTicker: 'EADSY', exchange: 'OTC', primaryExchange: 'EPA', companyName: 'Airbus SE' },
  // Japanese companies
  { searchTerms: ['toyota'], adrTicker: 'TM', exchange: 'NYSE', primaryExchange: 'TSE', companyName: 'Toyota Motor Corporation' },
  { searchTerms: ['sony'], adrTicker: 'SONY', exchange: 'NYSE', primaryExchange: 'TSE', companyName: 'Sony Group Corporation' },
  { searchTerms: ['honda'], adrTicker: 'HMC', exchange: 'NYSE', primaryExchange: 'TSE', companyName: 'Honda Motor Co.' },
  { searchTerms: ['softbank'], adrTicker: 'SFTBY', exchange: 'OTC', primaryExchange: 'TSE', companyName: 'SoftBank Group Corp.' },
  // Canadian companies
  { searchTerms: ['shopify'], adrTicker: 'SHOP', exchange: 'NYSE', primaryExchange: 'TSX', companyName: 'Shopify Inc.' },
  { searchTerms: ['royal bank', 'rbc'], adrTicker: 'RY', exchange: 'NYSE', primaryExchange: 'TSX', companyName: 'Royal Bank of Canada' },
  { searchTerms: ['td bank', 'toronto dominion'], adrTicker: 'TD', exchange: 'NYSE', primaryExchange: 'TSX', companyName: 'Toronto-Dominion Bank' },
  // Chinese companies (US-listed)
  { searchTerms: ['alibaba'], adrTicker: 'BABA', exchange: 'NYSE', primaryExchange: 'HKEX', companyName: 'Alibaba Group Holding' },
  { searchTerms: ['tencent'], adrTicker: 'TCEHY', exchange: 'OTC', primaryExchange: 'HKEX', companyName: 'Tencent Holdings' },
  { searchTerms: ['baidu'], adrTicker: 'BIDU', exchange: 'NASDAQ', primaryExchange: 'HKEX', companyName: 'Baidu Inc.' },
  // Indian companies
  { searchTerms: ['infosys'], adrTicker: 'INFY', exchange: 'NYSE', primaryExchange: 'NSE', companyName: 'Infosys Limited' },
  { searchTerms: ['wipro'], adrTicker: 'WIT', exchange: 'NYSE', primaryExchange: 'NSE', companyName: 'Wipro Limited' },
  { searchTerms: ['tata motors'], adrTicker: 'TTM', exchange: 'NYSE', primaryExchange: 'NSE', companyName: 'Tata Motors Limited' },
  // Private companies with US equity listings
  { searchTerms: ['spacex', 'space x', 'space exploration technologies'], adrTicker: 'SPCX', exchange: 'NASDAQ', primaryExchange: 'NASDAQ', companyName: 'Space Exploration Technologies Corp.' },
] as const;

export type AdrEntry = (typeof ADR_MAPPING)[number];

/**
 * Find an ADR entry matching the given search query.
 * Matches against searchTerms using substring matching in both directions.
 */
export function findADR(query: string): AdrEntry | null {
  const q = query.toLowerCase().trim();
  if (!q || q.length < 2) return null;
  return (
    ADR_MAPPING.find((entry) =>
      entry.searchTerms.some(
        (term) => q.includes(term) || term.includes(q)
      )
    ) ?? null
  );
}
