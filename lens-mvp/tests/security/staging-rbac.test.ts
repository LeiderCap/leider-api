import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type JsonRecord = Record<string, unknown>;

type AppResponse = {
  status: number;
  body: JsonRecord;
};

const repoRoot = join(import.meta.dirname, '..', '..');

function source(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8');
}

function assertNoError(error: { message?: string } | null, context: string): void {
  assert.equal(error, null, error?.message ?? context);
}

async function appRequest(
  baseUrl: string,
  cookie: string,
  path: string,
  init: RequestInit = {},
): Promise<AppResponse> {
  const response = await fetch(new URL(path, baseUrl), {
    ...init,
    headers: {
      ...(init.body ? { 'content-type': 'application/json' } : {}),
      ...(init.headers ?? {}),
      cookie,
    },
  });
  const body = (await response.json().catch(() => ({}))) as JsonRecord;
  return { status: response.status, body };
}

const serverMediatedEnv = [
  'STAGING_APP_URL',
  'STAGING_USER_A_COOKIE',
  'STAGING_USER_B_COOKIE',
  'STAGING_SUPABASE_URL',
  'STAGING_SERVICE_ROLE_KEY',
];
const serverMediatedEnabled = serverMediatedEnv.every((name) => Boolean(process.env[name]));
const directRlsEnv = [
  'STAGING_SUPABASE_URL',
  'STAGING_SUPABASE_ANON_KEY',
  'STAGING_USER_A_JWT',
  'STAGING_USER_B_JWT',
  'STAGING_USER_A_APP_UUID',
  'STAGING_USER_B_APP_UUID',
  'STAGING_SERVICE_ROLE_KEY',
];
const directRlsEnabled = directRlsEnv.every((name) => Boolean(process.env[name]));

/**
 * Required release gate: the application must enforce ownership through Clerk
 * auth context and server-side Supabase service-role queries. This test does
 * not require a browser-to-Supabase JWT configuration.
 */
test('required server-mediated authorization contract', () => {
  const privateRoutes = [
    'app/api/watchlists/route.ts',
    'app/api/watchlists/[id]/companies/route.ts',
    'app/api/memory/route.ts',
    'app/api/memory/session/[sessionId]/route.ts',
    'app/api/memory/item/[id]/route.ts',
    'app/api/blueprint/generate/route.ts',
    'app/api/reports/ai-governance/route.ts',
    'app/api/reports/buyer-evidence/route.ts',
    'app/api/reports/deployment-readiness/route.ts',
    'app/api/reports/resilience-capacity/route.ts',
  ];

  for (const route of privateRoutes) {
    const contents = source(route);
    assert.match(contents, /getAppAuthContext/ , `${route} must resolve Clerk identity server-side`);
    assert.doesNotMatch(
      contents,
      /body\.(user_id|owner_id)|searchParams\.get\(['"](user_id|owner_id)['"]\)/,
      `${route} must not authorize from a caller-supplied owner identifier`,
    );
  }

  const deletionRoute = source('app/api/memory/item/[id]/route.ts');
  assert.match(
    deletionRoute,
    /deleted:\s*\(data\s*\?\?\s*\[\]\)\.length\s*>\s*0/,
    'memory deletion must report actual deletion outcome',
  );

  const serviceClient = source('lib/supabase.ts');
  assert.match(serviceClient, /SUPABASE_SERVICE_ROLE_KEY/, 'service client must require the service-role key');
  assert.doesNotMatch(
    serviceClient,
    /SUPABASE_SERVICE_ROLE_KEY\s*\?\?\s*process\.env\.NEXT_PUBLIC_SUPABASE_ANON_KEY/,
    'service client must not silently fall back to anon credentials',
  );
});

/**
 * Required application-level integration gate when staging session cookies are
 * injected by CI or a secure local shell. Cookies are used only to exercise
 * the actual Clerk -> application -> service-role path; no Supabase JWT is
 * passed to the browser or to PostgREST.
 */
test('server-mediated staging ownership and no-op deletion behavior', async () => {
  assert.ok(
    serverMediatedEnabled,
    `required staging integration variables are missing: ${serverMediatedEnv.join(', ')}`,
  );
  const baseUrl = process.env.STAGING_APP_URL!;
  const cookieA = process.env.STAGING_USER_A_COOKIE!;
  const cookieB = process.env.STAGING_USER_B_COOKIE!;
  const cleanup = createClient(process.env.STAGING_SUPABASE_URL!, process.env.STAGING_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const suffix = `security-${Date.now()}`;
  let memoryA: string | null = null;
  let memoryB: string | null = null;
  let watchlistA: string | null = null;

  try {
    const createdA = await appRequest(baseUrl, cookieA, '/api/memory', {
      method: 'POST',
      body: JSON.stringify({
        item_type: 'lens_card',
        title: `${suffix}-a`,
        content: { synthetic: true, owner: 'a' },
        session_id: `${suffix}-a`,
      }),
    });
    assert.equal(createdA.status, 200);
    memoryA = String(createdA.body.id);
    assert.ok(memoryA && memoryA !== 'undefined');

    const createdB = await appRequest(baseUrl, cookieB, '/api/memory', {
      method: 'POST',
      body: JSON.stringify({
        item_type: 'lens_card',
        title: `${suffix}-b`,
        content: { synthetic: true, owner: 'b' },
        session_id: `${suffix}-b`,
      }),
    });
    assert.equal(createdB.status, 200);
    memoryB = String(createdB.body.id);
    assert.ok(memoryB && memoryB !== 'undefined');

    const crossRead = await appRequest(baseUrl, cookieB, `/api/memory/session/${suffix}-a`);
    assert.equal(crossRead.status, 200);
    assert.deepEqual(crossRead.body.items, [], 'User B must not read User A memory');

    const crossDelete = await appRequest(baseUrl, cookieB, `/api/memory/item/${memoryA}`, { method: 'DELETE' });
    assert.equal(crossDelete.status, 200);
    assert.equal(crossDelete.body.deleted, false, 'cross-user deletion must be an indistinguishable no-op');

    const ownDeleteB = await appRequest(baseUrl, cookieB, `/api/memory/item/${memoryB}`, { method: 'DELETE' });
    assert.equal(ownDeleteB.status, 200);
    assert.equal(ownDeleteB.body.deleted, true, 'owner deletion must report a deletion');
    memoryB = null;

    const watchlist = await appRequest(baseUrl, cookieA, '/api/watchlists', {
      method: 'POST',
      body: JSON.stringify({ name: `${suffix}-watchlist` }),
    });
    assert.equal(watchlist.status, 200);
    const watchlistBody = watchlist.body.watchlist as JsonRecord;
    watchlistA = String(watchlistBody.id);
    assert.ok(watchlistA && watchlistA !== 'undefined');

    const crossWatchlist = await appRequest(baseUrl, cookieB, '/api/watchlists');
    assert.equal(crossWatchlist.status, 200);
    const visibleWatchlists = Array.isArray(crossWatchlist.body.watchlists)
      ? crossWatchlist.body.watchlists as JsonRecord[]
      : [];
    assert.equal(
      visibleWatchlists.some((row) => row.id === watchlistA),
      false,
      'User B must not list User A watchlist',
    );

    const ownDeleteA = await appRequest(baseUrl, cookieA, `/api/memory/item/${memoryA}`, { method: 'DELETE' });
    assert.equal(ownDeleteA.status, 200);
    assert.equal(ownDeleteA.body.deleted, true, 'User A owner deletion must report a deletion');
    memoryA = null;
  } finally {
    if (memoryA) await appRequest(baseUrl, cookieA, `/api/memory/item/${memoryA}`, { method: 'DELETE' });
    if (memoryB) await appRequest(baseUrl, cookieB, `/api/memory/item/${memoryB}`, { method: 'DELETE' });
    if (watchlistA) await cleanup.from('watchlists').delete().eq('id', watchlistA);
  }
});

/**
 * Optional defense-in-depth test. The product does not use browser-to-
 * Supabase Clerk JWT requests; this remains available for environments that
 * separately configure Supabase JWT trust and want to validate RLS directly.
 */
test('optional direct Supabase JWT/RLS defense-in-depth', {
  skip: directRlsEnabled
    ? false
    : `optional direct-RLS test disabled; set ${directRlsEnv.join(', ')} only when JWT trust is intentionally configured`,
}, async () => {
  const client = (key: string, jwt?: string): SupabaseClient => createClient(process.env.STAGING_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: jwt ? { headers: { Authorization: `Bearer ${jwt}` } } : undefined,
  });

  const anon = client(process.env.STAGING_SUPABASE_ANON_KEY!);
  const userA = client(process.env.STAGING_SUPABASE_ANON_KEY!, process.env.STAGING_USER_A_JWT);
  const userB = client(process.env.STAGING_SUPABASE_ANON_KEY!, process.env.STAGING_USER_B_JWT);
  const service = client(process.env.STAGING_SERVICE_ROLE_KEY!);
  const suffix = `direct-rls-${Date.now()}`;
  const ownerA = process.env.STAGING_USER_A_APP_UUID!;
  let watchlistId: string | null = null;
  let savedItemId: string | null = null;

  try {
    const watchlist = await service.from('watchlists').insert({ user_id: ownerA, name: suffix }).select('id').single();
    assertNoError(watchlist.error, 'watchlist seed failed');
    assert.ok(watchlist.data, 'watchlist seed did not return an id');
    watchlistId = watchlist.data.id;

    const savedItem = await service
      .from('saved_items')
      .insert({ owner_id: ownerA, session_id: suffix, item_type: 'lens_card', title: suffix, content: {} })
      .select('id')
      .single();
    assertNoError(savedItem.error, 'saved item seed failed');
    assert.ok(savedItem.data, 'saved item seed did not return an id');
    savedItemId = savedItem.data.id;

    const ownWatchlist = await userA.from('watchlists').select('id').eq('id', watchlistId);
    assertNoError(ownWatchlist.error, 'User A watchlist read failed');
    assert.equal(ownWatchlist.data?.length, 1);

    const crossWatchlist = await userB.from('watchlists').select('id').eq('id', watchlistId);
    assertNoError(crossWatchlist.error, 'User B watchlist query failed');
    assert.equal(crossWatchlist.data?.length, 0, 'User B must not read User A watchlist');

    const guessedMemory = await userB.from('saved_items').select('id').eq('id', savedItemId);
    assertNoError(guessedMemory.error, 'User B memory query failed');
    assert.equal(guessedMemory.data?.length, 0, 'User B must not read User A memory');

    const publicRead = await anon.from('lens_analyses').select('oid').limit(1);
    assertNoError(publicRead.error, 'anonymous published-analysis read failed');
    const privateCompanies = await anon.from('companies').select('id').limit(1);
    assert.ok(privateCompanies.error, 'companies must not be anonymous-readable before privacy review');
  } finally {
    if (watchlistId) await service.from('watchlists').delete().eq('id', watchlistId);
    if (savedItemId) await service.from('saved_items').delete().eq('id', savedItemId);
  }
});
