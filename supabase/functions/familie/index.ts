/**
 * Supabase Edge Function: K2 Familie API
 * GET ?tenantId=... → { personen, momente, events }
 * POST { tenantId, personen?, momente?, events? } → speichert und gibt Daten zurück
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ALLOWED_ORIGINS = [
  'https://k2-galerie.vercel.app',
  'https://www.k2-galerie.vercel.app',
  'http://localhost:5177',
  'http://localhost:5178',
  'http://127.0.0.1:5177',
  'http://127.0.0.1:5178',
]

/** Exakte Liste + alle Vercel-Deployments, deren Host mit k2-galerie beginnt (Preview, Branch). */
function resolveAllowOrigin(origin: string): string {
  const fallback = ALLOWED_ORIGINS[0]
  if (!origin) return fallback
  if (ALLOWED_ORIGINS.includes(origin)) return origin
  try {
    const u = new URL(origin)
    if (u.protocol !== 'https:') return fallback
    const h = u.hostname
    if (h === 'k2-galerie.vercel.app' || h === 'www.k2-galerie.vercel.app') return origin
    if (h.endsWith('.vercel.app') && h.startsWith('k2-galerie')) return origin
  } catch {
    /* ignore */
  }
  return fallback
}

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') || ''
  const allowOrigin = resolveAllowOrigin(origin)
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  }
}

const TABLE = 'k2_familie_data'
const TYPES = ['personen', 'momente', 'events'] as const

/** PostgREST / Supabase-Fehler lesbar machen (500-Body + Logs). */
function serializeDbError(e: unknown): Record<string, string | undefined> {
  if (e && typeof e === 'object' && 'message' in e) {
    const x = e as { message?: string; details?: string; hint?: string; code?: string }
    return {
      message: String(x.message ?? e),
      details: x.details,
      hint: x.hint,
      code: x.code,
    }
  }
  return { message: e instanceof Error ? e.message : String(e) }
}

/** Edge Functions: Service Role umgeht RLS-Probleme; Fallback Anon (wie bisher). */
function createSupabaseServerClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const key = serviceKey || anonKey
  if (!supabaseUrl || !key) {
    throw new Error('Supabase env fehlt (SUPABASE_URL oder SERVICE_ROLE/ANON_KEY)')
  }
  return createClient(supabaseUrl, key)
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createSupabaseServerClient()

    if (req.method === 'GET') {
      const url = new URL(req.url)
      /** Diagnose: GET …/familie?health=1 → immer 200, zeigt DB-/Env-Status (keine Secrets). */
      if (url.searchParams.get('health') === '1') {
        const hasUrl = !!Deno.env.get('SUPABASE_URL')
        const hasService = !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        const hasAnon = !!Deno.env.get('SUPABASE_ANON_KEY')
        const { error: probeErr } = await supabase.from(TABLE).select('tenant_id').limit(1)
        return new Response(
          JSON.stringify({
            ok: !probeErr,
            hasSupabaseUrl: hasUrl,
            hasServiceRoleKey: hasService,
            hasAnonKey: hasAnon,
            table: TABLE,
            probe: probeErr ? serializeDbError(probeErr) : { message: 'select ok' },
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
        )
      }

      const tenantId = url.searchParams.get('tenantId') || 'default'
      const { data: rows, error } = await supabase
        .from(TABLE)
        .select('data_type, payload')
        .eq('tenant_id', tenantId)

      if (error) throw error
      const byType: Record<string, unknown[]> = { personen: [], momente: [], events: [] }
      let einstellungen: Record<string, unknown> | null = null
      for (const row of rows || []) {
        const t = row.data_type
        if (t === 'einstellungen' && row.payload && typeof row.payload === 'object' && !Array.isArray(row.payload)) {
          einstellungen = row.payload as Record<string, unknown>
          continue
        }
        if (t && Array.isArray(row.payload)) byType[t] = row.payload
      }
      return new Response(
        JSON.stringify({
          personen: byType.personen || [],
          momente: byType.momente || [],
          events: byType.events || [],
          ...(einstellungen ? { einstellungen } : {}),
          timestamp: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    if (req.method === 'POST') {
      let body: Record<string, unknown>
      try {
        const raw = await req.text()
        body = raw ? (JSON.parse(raw) as Record<string, unknown>) : {}
      } catch {
        return new Response(JSON.stringify({ error: { message: 'Body ist kein gültiges JSON' } }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        })
      }
      const tenantId = body?.tenantId || body?.tenant_id || 'default'
      const now = new Date().toISOString()
      const toUpsert: { tenant_id: string; data_type: string; payload: unknown; updated_at: string }[] = []
      for (const dataType of TYPES) {
        const arr = body[dataType]
        if (Array.isArray(arr)) {
          toUpsert.push({
            tenant_id: tenantId,
            data_type: dataType,
            payload: arr,
            updated_at: now,
          })
        }
      }
      const einst = body.einstellungen
      if (einst && typeof einst === 'object' && !Array.isArray(einst)) {
        toUpsert.push({
          tenant_id: tenantId,
          data_type: 'einstellungen',
          payload: einst,
          updated_at: now,
        })
      }
      if (toUpsert.length === 0) {
        return new Response(
          JSON.stringify({ personen: [], momente: [], events: [], count: 0 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
      }
      const { error } = await supabase.from(TABLE).upsert(toUpsert, {
        onConflict: 'tenant_id,data_type',
      })
      if (error) throw error
      const out: Record<string, unknown[]> = { personen: [], momente: [], events: [] }
      for (const row of toUpsert) {
        if (row.data_type === 'einstellungen') continue
        if (row.data_type in out) {
          out[row.data_type as keyof typeof out] = row.payload as unknown[]
        }
      }
      return new Response(
        JSON.stringify({
          personen: out.personen,
          momente: out.momente,
          events: out.events,
          count: toUpsert.length,
          timestamp: now,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    })
  } catch (e) {
    const err = serializeDbError(e)
    console.error('Familie API Error:', err.message, err.details ?? '', err.hint ?? '')
    return new Response(JSON.stringify({ error: err }), {
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
