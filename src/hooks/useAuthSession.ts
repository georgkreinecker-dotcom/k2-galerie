/**
 * Hook: Supabase Auth-Session für Admin (eingeloggt ja/nein, loading).
 */
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { getSupabaseAuthClient, isSupabaseConfigured } from '../utils/supabaseAuth'

export function useAuthSession(): { session: Session | null; loading: boolean; isConfigured: boolean } {
  const isConfigured = isSupabaseConfigured()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(isConfigured)

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false)
      return
    }
    let cancelled = false
    let cleanup: (() => void) | undefined
    try {
      const client = getSupabaseAuthClient()
      if (!client) {
        setLoading(false)
        return
      }
      client.auth.getSession()
        .then(({ data }: { data: { session: Session | null } }) => {
          if (!cancelled) {
            setSession(data?.session ?? null)
            setLoading(false)
          }
        })
        .catch(() => {
          if (!cancelled) setLoading(false)
        })
      const result = client.auth.onAuthStateChange((_event: import('@supabase/supabase-js').AuthChangeEvent, session: Session | null) => {
        if (!cancelled) setSession(session)
      })
      cleanup = () => {
        try { result?.data?.subscription?.unsubscribe?.() } catch (_) {}
      }
    } catch (_e) {
      setLoading(false)
    }
    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [isConfigured])

  return { session, loading, isConfigured }
}
