/**
 * Phase 2.2 Sportwagen: Ein API-Client für Senden/Empfangen.
 * Einheitlich: Retry 1x, Timeout, Rückgabe { success, data, error, hint }.
 * publishMobile und handleLoadFromServer („Bilder vom Server laden“) nutzen ihn.
 */

export interface ApiResult {
  success: boolean
  data?: unknown
  error?: string
  hint?: string
}

const DEFAULT_TIMEOUT_MS = 30000

function isNetworkError(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e)
  return /failed|network|load|cors|fetch|typeerror/i.test(msg) || (e instanceof TypeError)
}

/**
 * GET mit Retry 1x bei Netzwerkfehler, Timeout, einheitliche Rückgabe.
 * Wenn Antwort HTML ist (z. B. Fehlerseite), success=false, hint gesetzt.
 */
export async function apiGet(
  url: string,
  options: { timeoutMs?: number; retryOnce?: boolean } = {}
): Promise<ApiResult> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const retryOnce = options.retryOnce !== false

  const doFetch = async (): Promise<ApiResult> => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const res = await fetch(url, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store' },
        mode: 'cors',
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      if (!res.ok) {
        const hint = res.status === 404 ? ' Datei fehlt auf dem Server.' : ''
        return { success: false, error: `Server ${res.status}`, hint: hint.trim() || undefined }
      }
      const text = await res.text()
      if (text.trim().startsWith('<')) {
        return {
          success: false,
          error: 'Server liefert Webseite statt Daten',
          hint: 'Direkt k2-galerie.vercel.app öffnen und dort „Bilder vom Server laden“ versuchen.'
        }
      }
      let data: unknown
      try {
        data = text ? JSON.parse(text) : null
      } catch {
        return { success: false, error: 'Antwort war kein gültiges JSON' }
      }
      return { success: true, data }
    } catch (e) {
      clearTimeout(timeoutId)
      if (e instanceof Error && e.name === 'AbortError') {
        return { success: false, error: 'Zeitüberschreitung (Request zu lange)' }
      }
      throw e
    }
  }

  try {
    return await doFetch()
  } catch (e) {
    if (retryOnce && isNetworkError(e)) {
      await new Promise(r => setTimeout(r, 2000))
      return doFetch()
    }
    const msg = e instanceof Error ? e.message : String(e)
    return { success: false, error: msg }
  }
}

/**
 * POST mit Timeout, einheitliche Rückgabe.
 * Erwartet JSON-Response mit optional success, error, hint.
 */
export async function apiPost(
  url: string,
  body: string | object,
  options: { timeoutMs?: number } = {}
): Promise<ApiResult> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: typeof body === 'string' ? body : JSON.stringify(body),
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    const text = await res.text()
    let result: { success?: boolean; error?: string; hint?: string; [k: string]: unknown }
    try {
      result = text ? JSON.parse(text) : {}
    } catch {
      result = { error: text ? text.slice(0, 300) : 'Keine Antwort' }
    }
    if (res.ok && result.success === true) {
      return { success: true, data: result }
    }
    const error = result?.error ?? (res.status !== 200 ? `Server ${res.status}` : 'Unbekannter Fehler')
    const hint = result?.hint
    return { success: false, error, hint }
  } catch (e) {
    clearTimeout(timeoutId)
    if (e instanceof Error && e.name === 'AbortError') {
      return { success: false, error: 'Zeitüberschreitung (Request zu lange)' }
    }
    const msg = e instanceof Error ? e.message : String(e)
    return { success: false, error: msg }
  }
}
