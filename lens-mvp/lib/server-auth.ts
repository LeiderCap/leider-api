import { auth, currentUser } from '@clerk/nextjs/server';
import { getServiceSupabaseClient } from '@/lib/supabase';

export type AppAuthContext = {
  clerkUserId: string;
  appUserId: string;
  service: ReturnType<typeof getServiceSupabaseClient>;
};

/**
 * Verifies the Clerk session and provisions/resolves the application UUID.
 * Request-body/query-string user IDs are intentionally not accepted here.
 */
export async function getAppAuthContext(): Promise<AppAuthContext | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  const email = clerkUser?.primaryEmailAddress?.emailAddress ?? clerkUser?.emailAddresses[0]?.emailAddress;
  if (!email) {
    throw new Error('A verified email address is required to provision the application user.');
  }

  const service = getServiceSupabaseClient();
  const { data, error } = await service
    .from('users')
    .upsert(
      {
        clerk_user_id: userId,
        email,
        name: [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ') || null,
      },
      { onConflict: 'clerk_user_id' },
    )
    .select('id')
    .single();

  if (error || !data?.id) {
    throw new Error(`Application user provisioning failed: ${error?.message ?? 'missing user id'}`);
  }

  return { clerkUserId: userId, appUserId: data.id, service };
}
