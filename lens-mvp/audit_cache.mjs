import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const { data, error } = await supabase
  .from('opportunity_zone_cache')
  .select('ticker, price_change_3y, price_change_1y, fcf_yield, share_count_trend, ceo_tenure_months, zones_assigned, opportunity_score, market_cap, sector')
  .order('fetched_at', { ascending: false })
  .limit(30);

if (error) {
  console.error('Supabase error:', error.message);
  process.exit(1);
}

console.log(`Total rows fetched: ${data.length}`);
console.log('\n--- NULL AUDIT ---');

const nullCounts = {
  price_change_3y: 0,
  price_change_1y: 0,
  fcf_yield: 0,
  share_count_trend: 0,
  ceo_tenure_months: 0,
  zones_assigned: 0,
  opportunity_score: 0,
};

for (const row of data) {
  for (const field of Object.keys(nullCounts)) {
    if (row[field] === null || row[field] === undefined) nullCounts[field]++;
  }
}

console.log('Null counts across 30 rows:');
for (const [field, count] of Object.entries(nullCounts)) {
  console.log(`  ${field}: ${count} null (${Math.round(count/data.length*100)}%)`);
}

console.log('\n--- SAMPLE ROWS ---');
for (const row of data.slice(0, 5)) {
  console.log(`${row.ticker}: 3Y=${row.price_change_3y}, 1Y=${row.price_change_1y}, FCF=${row.fcf_yield}, trend=${row.share_count_trend}, zones=${JSON.stringify(row.zones_assigned)}, score=${row.opportunity_score}, sector=${row.sector}`);
}

console.log('\n--- ZONE DISTRIBUTION ---');
const zoneCounts = {};
for (const row of data) {
  for (const z of (row.zones_assigned ?? [])) {
    zoneCounts[z] = (zoneCounts[z] || 0) + 1;
  }
}
console.log(JSON.stringify(zoneCounts, null, 2));
