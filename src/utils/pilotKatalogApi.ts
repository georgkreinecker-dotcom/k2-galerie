/**
 * Pilot-/Testuser-Katalog: zentrale Liste auf Vercel Blob (/api/pilot-katalog).
 * Ohne VITE_PILOT_KATALOG_API_KEY: nur localStorage (wie bisher).
 */
import { loadTestuserKatalog, saveTestuserKatalog, type TestuserKatalogEintrag } from './testuserKatalogStorage'
import { mergePilotKatalog } from './pilotKatalogMerge'

const VITE_KEY = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_PILOT_KATALOG_API_KEY : undefined
const SYNC_KEY = typeof VITE_KEY === 'string' ? VITE_KEY : ''

let pushTimer: ReturnType<typeof setTimeout> | null = null
const PUSH_DEBOUNCE_MS = 600

export function isPilotKatalogSyncConfigured(): boolean {
  return SYNC_KEY.length >= 8
}

function headers(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-api-key': SYNC_KEY,
  }
}

export async function fetchPilotKatalogFromServer(): Promise<TestuserKatalogEintrag[] | null> {
  if (!isPilotKatalogSyncConfigured()) return null
  try {
    const res = await fetch('/api/pilot-katalog', {
      method: 'GET',
      headers: { 'x-api-key': SYNC_KEY },
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = (await res.json()) as { entries?: unknown }
    if (!Array.isArray(data.entries)) return null
    return data.entries.filter(
      (e): e is TestuserKatalogEintrag =>
        e &&
        typeof e === 'object' &&
        typeof (e as TestuserKatalogEintrag).id === 'string' &&
        typeof (e as TestuserKatalogEintrag).name === 'string'
    )
  } catch {
    return null
  }
}

export async function pushPilotKatalogToServer(entries: TestuserKatalogEintrag[]): Promise<boolean> {
  if (!isPilotKatalogSyncConfigured()) return false
  try {
    const res = await fetch('/api/pilot-katalog', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ entries }),
    })
    return res.ok
  } catch {
    return false
  }
}

/** Nach lokaler Änderung: kurz warten, dann volle Liste senden. */
export function schedulePilotKatalogPush(): void {
  if (!isPilotKatalogSyncConfigured()) return
  if (pushTimer != null) clearTimeout(pushTimer)
  pushTimer = setTimeout(() => {
    pushTimer = null
    const list = loadTestuserKatalog()
    void pushPilotKatalogToServer(list)
  }, PUSH_DEBOUNCE_MS)
}

/**
 * Server + lokal zusammenführen und wieder speichern; danach Server auf merged Stand bringen.
 */
export async function pullAndMergePilotKatalog(): Promise<'ok' | 'offline' | 'error'> {
  if (!isPilotKatalogSyncConfigured()) return 'offline'
  const remote = await fetchPilotKatalogFromServer()
  if (remote === null) return 'error'
  const local = loadTestuserKatalog()
  const merged = mergePilotKatalog(remote, local)
  saveTestuserKatalog(merged, { skipRemotePush: true })
  const pushed = await pushPilotKatalogToServer(merged)
  return pushed ? 'ok' : 'error'
}
