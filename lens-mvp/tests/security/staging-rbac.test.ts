import assert from 'node:assert/strict';
import test from 'node:test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const required = [
  'STAGING_SUPABASE_URL',
  'STAGING_SUPABASE_ANON_KEY',
  'STAGING_USER_A_JWT',
  'STAGING_USER_B_JWT',
  'STAGING_USER_A_APP_UUID',
  'STAGING_USER_B_APP_UUID',
  'STAGING_SERVICE_ROLE_KEY',
];

const enabled = required.every((name) => Boolean(process.env[name]));
const skipReason = `staging integration disabled; set ${required.join(', ')} to run against an isolated staging project`;

function client(key: string, jwt?: string): SupabaseClient {
  return createClient(process.env.STAGING_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: jwt ? { headers: { Authorization: `Bearer ${jwt}` } } : undefined,
  });
}

test('staging RLS isolates anonymous, User A, User B, and service-role access', {
  skip: enabled ? false : skipReason,
}, async () => {
  const anon = client(process.env.STAGING_SUPABASE_ANON_KEY!);
  const userA = client(process.env.STAGING_SUPABASE_ANON_KEY!, process.env.STAGING_USER_A_JWT);
  const userB = client(process.env.STAGING_SUPABASE_ANON_KEY!, process.env.STAGING_USER_B_JWT);
  const service = client(process.env.STAGING_SERVICE_ROLE_KEY!);
  const suffix = `security-${Date.now()}`;
  const ownerA = process.env.STAGING_USER_A_APP_UUID!;
  const ownerB = process.env.STAGING_USER_B_APP_UUID!;
  const publicOid = `STAGING-PUBLIC-${suffix}`;
  const privateOid = `STAGING-PRIVATE-${suffix}`;
  let watchlistId: string | null = null;
  let savedItemId: string | null = null;
  let blueprintId: string | null = null;
  let reportId: string | null = null;

  try {
    const watchlist = await service
      .from('watchlists')
      .insert({ user_id: ownerA, name: suffix })
      .select('id')
      .single();
    assert.equal(watchlist.error, null, watchlist.error?.message);
    watchlistId = watchlist.data.id;

    const savedItem = await service
      .from('saved_items')
      .insert({ owner_id: ownerA, session_id: suffix, item_type: 'lens_card', title: suffix, content: {} })
      .select('id')
      .single();
    assert.equal(savedItem.error, null, savedItem.error?.message);
    savedItemId = savedItem.data.id;

    const blueprint = await service
      .from('blueprints')
      .insert({ owner_id: ownerA, entity_name: suffix, entity_type: 'Company', blueprint: {}, session_id: suffix })
      .select('id')
      .single();
    assert.equal(blueprint.error, null, blueprint.error?.message);
    blueprintId = blueprint.data.id;

    const report = await service
      .from('lens_reports')
      .insert({ owner_id: ownerA, company_name: suffix, ticker: suffix, free_report_json: {} })
      .select('id')
      .single();
    assert.equal(report.error, null, report.error?.message);
    reportId = report.data.id;

    const analyses = await service.from('lens_analyses').insert([
      {
        oid: publicOid,
        ticker: suffix,
        company_name: suffix,
        analysis_json: {},
        is_public: true,
        is_latest: false,
      },
      {
        oid: privateOid,
        ticker: suffix,
        company_name: suffix,
        analysis_json: {},
        is_public: false,
        is_latest: false,
      },
    ]);
    assert.equal(analyses.error, null, analyses.error?.message);

    const publicRead = await anon.from('lens_analyses').select('oid').eq('oid', publicOid);
    assert.equal(publicRead.error, null, publicRead.error?.message);
    assert.equal(publicRead.data?.length, 1);

    const privateRead = await anon.from('lens_analyses').select('oid').eq('oid', privateOid);
    assert.equal(privateRead.error, null, privateRead.error?.message);
    assert.equal(privateRead.data?.length, 0, 'unpublished analysis must not be anonymous-readable');

    const ownWatchlist = await userA.from('watchlists').select('id').eq('id', watchlistId);
    assert.equal(ownWatchlist.error, null, ownWatchlist.error?.message);
    assert.equal(ownWatchlist.data?.length, 1);

    const crossWatchlist = await userB.from('watchlists').select('id').eq('id', watchlistId);
    assert.equal(crossWatchlist.error, null, crossWatchlist.error?.message);
    assert.equal(crossWatchlist.data?.length, 0, 'User B must not read User A watchlist');

    const guessedMemory = await userB.from('saved_items').select('id').eq('id', savedItemId);
    assert.equal(guessedMemory.error, null, guessedMemory.error?.message);
    assert.equal(guessedMemory.data?.length, 0, 'guessed memory identifier must not disclose User A data');

    const guessedBlueprint = await userB.from('blueprints').select('id').eq('id', blueprintId);
    assert.equal(guessedBlueprint.error, null, guessedBlueprint.error?.message);
    assert.equal(guessedBlueprint.data?.length, 0, 'guessed blueprint identifier must not disclose User A data');

    const guessedReport = await userB.from('lens_reports').select('id').eq('id', reportId);
    assert.equal(guessedReport.error, null, guessedReport.error?.message);
    assert.equal(guessedReport.data?.length, 0, 'guessed report identifier must not disclose User A data');

    const forgedWatchlist = await userB
      .from('watchlists')
      .insert({ user_id: ownerA, name: `${suffix}-forged` });
    assert.ok(forgedWatchlist.error, 'User B must not insert a row owned by User A');

    const forgedMemory = await userB
      .from('saved_items')
      .insert({ owner_id: ownerA, session_id: `${suffix}-forged`, item_type: 'lens_card', content: {} });
    assert.ok(forgedMemory.error, 'User B must not insert memory owned by User A');

    const forgedDelete = await userB.from('watchlists').delete().eq('id', watchlistId);
    assert.equal(forgedDelete.error, null, forgedDelete.error?.message);
    const stillExists = await service.from('watchlists').select('id').eq('id', watchlistId);
    assert.equal(stillExists.data?.length, 1, 'User B delete must not remove User A watchlist');

    const serviceRead = await service.from('lens_reports').select('id').eq('id', reportId);
    assert.equal(serviceRead.error, null, serviceRead.error?.message);
    assert.equal(serviceRead.data?.length, 1, 'service role must access private staging records');

    const publicCompanies = await anon.from('companies').select('id').limit(1);
    assert.ok(publicCompanies.error, 'companies must not be anonymous-readable before privacy review');
  } finally {
    if (watchlistId) await service.from('watchlists').delete().eq('id', watchlistId);
    if (savedItemId) await service.from('saved_items').delete().eq('id', savedItemId);
    if (blueprintId) await service.from('blueprints').delete().eq('id', blueprintId);
    if (reportId) await service.from('lens_reports').delete().eq('id', reportId);
    await service.from('lens_analyses').delete().in('oid', [publicOid, privateOid]);
  }
});
