import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const savedRoute = '../../app/api/saved/route';
const adminRoute = '../../app/api/admin/expire-cache/route';

test('legacy /api/saved handlers return 404 without importing persistence code', async () => {
  const source = readFileSync('app/api/saved/route.ts', 'utf8');
  assert.doesNotMatch(source, /getAppAuthContext|getServiceSupabaseClient|getPublicSupabaseClient|from\(/);

  const { GET, POST, DELETE } = await import(savedRoute);
  for (const handler of [GET, POST, DELETE]) {
    const response = await handler();
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { error: 'Not found' });
  }
});

test('admin authorization accepts only a bearer header and never a query secret', async () => {
  const { authorizeAdminRequest } = await import(adminRoute);
  const previous = process.env.ADMIN_SECRET;
  process.env.ADMIN_SECRET = 'unit-test-admin-secret';

  try {
    assert.equal(authorizeAdminRequest(new Request('https://example.test/api/admin/expire-cache?ticker=PL&secret=unit-test-admin-secret')), false);
    assert.equal(authorizeAdminRequest(new Request('https://example.test/api/admin/expire-cache?ticker=PL')), false);
    assert.equal(authorizeAdminRequest(new Request('https://example.test/api/admin/expire-cache?ticker=PL', {
      headers: { authorization: 'Bearer wrong-secret' },
    })), false);
    assert.equal(authorizeAdminRequest(new Request('https://example.test/api/admin/expire-cache?ticker=PL', {
      headers: { authorization: 'Bearer unit-test-admin-secret' },
    })), true);
  } finally {
    if (previous === undefined) delete process.env.ADMIN_SECRET;
    else process.env.ADMIN_SECRET = previous;
  }
});

test('admin route source does not log or return the secret and does not read query-string credentials', () => {
  const source = readFileSync('app/api/admin/expire-cache/route.ts', 'utf8');
  assert.match(source, /headers\.get\(['"]authorization['"]\)/);
  assert.doesNotMatch(source, /searchParams\.get\(['"]secret['"]\)/);
  assert.doesNotMatch(source, /console\.(log|error|warn)\([^\n]*(adminSecret|suppliedSecret|authorization)/);
  assert.doesNotMatch(source, /error:\s*[^,\n]*adminSecret/);
});

test('watchlist detail resolves Clerk ownership before reading private rows', () => {
  const source = readFileSync('app/watchlists/[id]/page.tsx', 'utf8');
  assert.match(source, /getAppAuthContext/);
  assert.match(source, /\.eq\('user_id', context\.appUserId\)/);
  assert.match(source, /context\.service/);
  assert.match(source, /if \(!owned\) notFound\(\)/);
  assert.doesNotMatch(source, /getSupabaseClient/);
  assert.doesNotMatch(source, /searchParams\.get\(['"]user_id['"]\)/);
});
