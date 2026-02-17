/**
 * Supabase Auth für Admin-Zugang (Produkt-Label Sicherheit).
 * Wenn Supabase konfiguriert ist: echtes Login; sonst Fallback auf bestehenden Unlock (localStorage).
 */

import { createClient } from '@supabase/supabase-js'
import type { Session, AuthChangeEvent } from '@supabase/supabase-js'

let SUPABASE_URL = ''
let SUPABASE_ANON_KEY = ''
try {
  const env = import.meta.env || {}
  SUPABASE_URL = String(env.VITE_SUPABASE_URL || '')
  SUPABASE_ANON_KEY = String(env.VITE_SUPABASE_ANON_KEY || '')
} catch {
  // ignore
}

const USE_SUPABASE = !!SUPABASE_URL && !!SUPABASE_ANON_KEY && SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0

let authClient: ReturnType<typeof createClient> | null = null

export function isSupabaseConfigured(): boolean {
  return USE_SUPABASE
}

/** Supabase-Client nur für Auth (signIn, session). Nie werfen – bei Fehler null. */
export function getSupabaseAuthClient() {
  if (!USE_SUPABASE) return null
  if (authClient) return authClient
  try {
    authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true }
    })
    return authClient
  } catch (_e) {
    return null
  }
}

/** Aktuelles Access-Token für API-Aufrufe (Edge Function). Wenn eingeloggt: JWT; sonst null. */
export async function getAuthToken(): Promise<string | null> {
  if (!USE_SUPABASE) return null
  try {
    const client = getSupabaseAuthClient()
    if (!client) return null
    const { data } = await client.auth.getSession()
    return data?.session?.access_token ?? null
  } catch (_e) {
    return null
  }
}

/** Session abonnieren (für UI: eingeloggt ja/nein). Cleanup immer sicher. */
export function onAuthStateChange(callback: (session: Session | null) => void) {
  try {
    const client = getSupabaseAuthClient()
    if (!client) {
      callback(null)
      return () => {}
    }
    const { data } = client.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      try { callback(session) } catch (_) {}
    })
    const sub = data?.subscription
    return () => {
      try { sub?.unsubscribe?.() } catch (_) {}
    }
  } catch (_e) {
    callback(null)
    return () => {}
  }
}

/** E-Mail/Passwort-Login. */
export async function signIn(email: string, password: string): Promise<{ error: string | null }> {
  try {
    const client = getSupabaseAuthClient()
    if (!client) return { error: 'Supabase nicht konfiguriert' }
    const { error } = await client.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  } catch (e: any) {
    return { error: e?.message ?? 'Anmeldung fehlgeschlagen' }
  }
}

/** Abmelden. */
export async function signOut(): Promise<void> {
  try {
    const client = getSupabaseAuthClient()
    if (client) await client.auth.signOut()
  } catch (_e) {}
}
