import { createClient } from '@/lib/supabase/server'

/**
 * Returns the current Supabase user shaped for the dashboard header,
 * or null when no one is signed in.
 */
export async function getHeaderUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  return {
    id: user.id,
    name: (user.user_metadata?.name as string | undefined) ?? null,
    email: user.email ?? '',
  }
}
