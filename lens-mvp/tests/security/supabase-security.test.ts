import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import test from 'node:test';

const supabaseModule = '../../lib/supabase';

function clearSupabaseEnv() {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
}

test('service client fails closed when service-role key is missing', async () => {
  const { getServiceSupabaseClient } = await import(supabaseModule);
  clearSupabaseEnv();
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://staging.example.supabase.co';

  assert.throws(
    () => getServiceSupabaseClient(),
    /SUPABASE_SERVICE_ROLE_KEY is required/
  );
});

test('public client requires anon credentials explicitly', async () => {
  const { getPublicSupabaseClient } = await import(supabaseModule);
  clearSupabaseEnv();
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://staging.example.supabase.co';

  assert.throws(
    () => getPublicSupabaseClient(),
    /NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured/
  );
});

test('local environment file is not tracked and example has no non-empty assignments', () => {
  const tracked = execFileSync('git', ['ls-files', '.env.local'], { encoding: 'utf8' }).trim();
  assert.equal(tracked, '');

  const example = readFileSync('.env.example', 'utf8');
  for (const line of example.split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue;
    const equals = line.indexOf('=');
    assert.notEqual(equals, -1);
    assert.equal(line.slice(equals + 1).trim(), '', `non-empty example assignment: ${line.slice(0, equals)}`);
  }
});

test('hardening migration preserves only explicitly public Lens analysis reads', () => {
  const migration = readFileSync('sql/security_hardening_v1.sql', 'utf8');
  assert.match(migration, /published_analyses_are_public/);
  assert.match(migration, /FOR SELECT TO anon, authenticated[\s\S]*?USING \(is_public = true\)/);
  assert.match(migration, /current_clerk_user_id/);
  assert.match(migration, /current_app_user_id/);
  assert.match(migration, /DROP POLICY IF EXISTS %I ON public.%I/);
  assert.match(migration, /service_role_manage_ground_truth/);
  assert.match(migration, /service_role_manage_report_cache/);
  assert.doesNotMatch(migration, /CREATE POLICY "public_read_(companies|lens_scores|cached_stock_prices|opportunity_zone_cache)"/);
  assert.doesNotMatch(migration, /CREATE POLICY "public_select_saved_items"/);
});

test('private routes derive ownership from the shared Clerk auth context', () => {
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

  for (const path of privateRoutes) {
    const source = readFileSync(path, 'utf8');
    assert.match(source, /getAppAuthContext/, `${path} must verify Clerk/application identity`);
  }

  for (const path of ['app/api/watchlists/route.ts']) {
    const source = readFileSync(path, 'utf8');
    assert.doesNotMatch(source, /body\.user_id|searchParams\.get\(['"]user_id/);
  }

  const suspendedSavedRoute = readFileSync('app/api/saved/route.ts', 'utf8');
  assert.doesNotMatch(suspendedSavedRoute, /getAppAuthContext|getServiceSupabaseClient|from\(/);

  assert.match(readFileSync('proxy.ts', 'utf8'), /clerkMiddleware/);
  assert.match(readFileSync('app/api/blueprint/generate/route.ts', 'utf8'), /owner_id: authContext\.appUserId/);
  assert.match(readFileSync('app/api/reports/buyer-evidence/route.ts', 'utf8'), /owner_id: authContext\.appUserId/);
});
