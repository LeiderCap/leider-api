import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { POST as goDeepPost } from '../../app/api/go-deep/route';
import { POST as goDeepRewritePost } from '../../app/api/go-deep-rewrite/route';
import GoDeepPage from '../../app/go-deep/page';

const repoRoot = join(import.meta.dirname, '..', '..');

function source(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8');
}

test('suspended Go Deep page returns a normal not-found response', () => {
  assert.throws(() => GoDeepPage(), /NEXT_HTTP_ERROR_FALLBACK;404/);
});

test('suspended Go Deep APIs return 404 without provider or database access', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error('model provider must not be called');
  };

  try {
    const request = new Request('http://localhost/api/go-deep', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ content: 'Synthetic content that must not be processed.' }),
    });
    const rewriteRequest = new Request('http://localhost/api/go-deep-rewrite', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ original_content: 'Synthetic content.', delta: {} }),
    });

    const response = await goDeepPost(request);
    const rewriteResponse = await goDeepRewritePost(rewriteRequest);
    assert.equal(response.status, 404);
    assert.equal(rewriteResponse.status, 404);
    assert.deepEqual(await response.json(), { error: 'Not Found' });
    assert.deepEqual(await rewriteResponse.json(), { error: 'Not Found' });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('public discovery links do not expose suspended Go Deep entry points', () => {
  for (const path of ['app/layout.tsx', 'app/lens/[id]/page.tsx', 'app/saved/page.tsx', 'app/sitemap.ts']) {
    assert.doesNotMatch(source(path), /href=["']\/go-deep["']/);
  }
});

test('explicit saved-item functionality remains authenticated and owner-scoped', () => {
  const memoryRoute = source('app/api/memory/route.ts');
  assert.match(memoryRoute, /getAppAuthContext/);
  assert.match(memoryRoute, /Authentication required/);
  assert.match(memoryRoute, /owner_id:\s*context\.appUserId/);
  assert.doesNotMatch(memoryRoute, /owner_id\s*:\s*body\.|owner_id\s*:\s*req\./);
});
