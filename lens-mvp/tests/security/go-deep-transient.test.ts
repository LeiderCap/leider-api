import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { NextRequest } from 'next/server';
import { POST as goDeepPost } from '../../app/api/go-deep/route';

const repoRoot = join(import.meta.dirname, '..', '..');

function source(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8');
}

test('Go Deep generation is anonymous, transient, and still returns the model result', () => {
  const route = source('app/api/go-deep/route.ts');

  assert.doesNotMatch(route, /getServiceSupabaseClient|from\(['"]go_deep_analyses['"]\)/);
  assert.match(route, /return NextResponse\.json\(parsed\)/);
  assert.match(route, /MAX_CONTENT_LENGTH\s*=\s*20_000/);
  assert.match(route, /status:\s*413/);
  assert.match(route, /max_tokens:\s*2_500/);
});

test('anonymous Go Deep generation returns a provider result without a database client', async () => {
  const originalFetch = globalThis.fetch;
  const originalApiKey = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = 'test-only-provider-key';
  globalThis.fetch = async () => new Response(JSON.stringify({
    choices: [{ message: { content: JSON.stringify({ tcs_c_score: 100 }) } }],
  }), { status: 200, headers: { 'content-type': 'application/json' } });

  try {
    const response = await goDeepPost(new NextRequest('http://localhost/api/go-deep', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ content: 'A synthetic public analysis request.' }),
    }));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { tcs_c_score: 100 });
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalApiKey;
  }
});

test('Go Deep rewrite is transient and bounded without database persistence', () => {
  const route = source('app/api/go-deep-rewrite/route.ts');

  assert.doesNotMatch(route, /getServiceSupabaseClient|createClient|\.from\(/);
  assert.match(route, /return NextResponse\.json\(parsed\)/);
  assert.match(route, /MAX_CONTENT_LENGTH\s*=\s*20_000/);
  assert.match(route, /status:\s*413/);
  assert.match(route, /max_tokens:\s*2_500/);
});

test('explicit Go Deep saving remains authenticated and owner-scoped', () => {
  const memoryRoute = source('app/api/memory/route.ts');

  assert.match(memoryRoute, /getAppAuthContext/);
  assert.match(memoryRoute, /Authentication required/);
  assert.match(memoryRoute, /owner_id:\s*context\.appUserId/);
  assert.doesNotMatch(memoryRoute, /owner_id\s*:\s*body\.|owner_id\s*:\s*req\./);
});
