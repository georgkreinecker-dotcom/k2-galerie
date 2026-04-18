/**
 * APf-intern: Testuser-Katalog (Georg) – manuell oder automatisch beim Pilot-Zettel.
 */

const KEY = 'k2-apf-testuser-katalog'
/** Einmalig: drei Platzhalter-Einträge für bestehende Piloten (Namen/Links in der Mappe anpassen) */
const SEED_FLAG = 'k2-apf-testuser-katalog-seeded-v1'

export type TestuserKatalogStatus =
  | 'bewerbung'
  | 'zugang_gesendet'
  | 'test_aktiv'
  | 'protokoll_eingereicht'
  | 'freigabe'
  | 'sonstiges'

export type TestuserKatalogEintrag = {
  id: string
  name: string
  appName: string
  email: string
  phone: string
  notiz: string
  status: TestuserKatalogStatus
  createdAt: string
  /** Für Merge Server ↔ Gerät (neuere Version gewinnt) */
  updatedAt?: string
  /** Relativer Link zum Zugangsblatt (z. B. /zettel-pilot?…), nach Versand/Druck gesetzt */
  zugangsblattUrl?: string
  pilotLinie?: 'oek2' | 'vk2' | 'familie'
  zettelNr?: string
  /** Eindeutiger Schlüssel für Abgleich bei neuem Pilot-Zettel */
  pilotRegKey?: string
}

const STATUS_LABELS: Record<TestuserKatalogStatus, string> = {
  bewerbung: 'Bewerbung',
  zugang_gesendet: 'Zugang gesendet',
  test_aktiv: 'Test aktiv',
  protokoll_eingereicht: 'Protokoll eingereicht',
  freigabe: 'Freigabe / Abschluss',
  sonstiges: 'Sonstiges',
}

export function getTestuserKatalogStatusLabel(s: TestuserKatalogStatus): string {
  return STATUS_LABELS[s] ?? s
}

export function loadTestuserKatalog(): TestuserKatalogEintrag[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (e): e is TestuserKatalogEintrag =>
        e &&
        typeof e === 'object' &&
        typeof (e as TestuserKatalogEintrag).id === 'string' &&
        typeof (e as TestuserKatalogEintrag).name === 'string'
    )
  } catch {
    return []
  }
}

export function saveTestuserKatalog(
  list: TestuserKatalogEintrag[],
  opts?: { skipRemotePush?: boolean }
): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    console.warn('⚠️ Testuser-Katalog konnte nicht gespeichert werden')
  }
  if (!opts?.skipRemotePush && typeof window !== 'undefined') {
    void import('./pilotKatalogApi')
      .then((m) => m.schedulePilotKatalogPush())
      .catch(() => {})
  }
}

export function addTestuserKatalogEintrag(e: Omit<TestuserKatalogEintrag, 'id' | 'createdAt'>): TestuserKatalogEintrag[] {
  const now = new Date().toISOString()
  const neu: TestuserKatalogEintrag = {
    ...e,
    id: `tu-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  }
  const next = [...loadTestuserKatalog(), neu]
  saveTestuserKatalog(next)
  return next
}

/** Drei bestehende Piloten – in der Mappe umbenennen und ggf. Zugangsblatt-Link setzen */
const INITIAL_THREE: Array<Omit<TestuserKatalogEintrag, 'id' | 'createdAt'>> = [
  {
    name: 'Bestehender Pilot 1',
    appName: '—',
    email: '',
    phone: '',
    notiz: 'Bitte Namen, App-Bezeichnung und Link zum Zugangsblatt eintragen',
    status: 'zugang_gesendet',
    zugangsblattUrl: '',
    pilotLinie: 'oek2',
    zettelNr: '',
  },
  {
    name: 'Bestehender Pilot 2',
    appName: '—',
    email: '',
    phone: '',
    notiz: 'Bitte Namen, App-Bezeichnung und Link zum Zugangsblatt eintragen',
    status: 'zugang_gesendet',
    zugangsblattUrl: '',
    pilotLinie: 'vk2',
    zettelNr: '',
  },
  {
    name: 'Bestehender Pilot 3',
    appName: '—',
    email: '',
    phone: '',
    notiz: 'Bitte Namen, App-Bezeichnung und Link zum Zugangsblatt eintragen',
    status: 'zugang_gesendet',
    zugangsblattUrl: '',
    pilotLinie: 'familie',
    zettelNr: '',
  },
]

/**
 * Legt einmalig drei Platzhalter an (fehlende seed-IDs). Idempotent.
 */
export function ensureTestuserKatalogSeedOnce(): void {
  try {
    if (typeof localStorage === 'undefined') return
    if (localStorage.getItem(SEED_FLAG) === '1') return
    const cur = loadTestuserKatalog()
    const existingIds = new Set(cur.map((e) => e.id))
    const seeds: TestuserKatalogEintrag[] = INITIAL_THREE.map((s, i) => {
      const now = new Date().toISOString()
      return {
        ...s,
        id: `seed-pilot-${i + 1}`,
        createdAt: now,
        updatedAt: now,
      }
    })
    const merged = [...cur]
    for (const s of seeds) {
      if (!existingIds.has(s.id)) merged.push(s)
    }
    saveTestuserKatalog(merged)
    localStorage.setItem(SEED_FLAG, '1')
  } catch {
    /* ignore */
  }
}

function buildPilotRegKey(zettelNr: string, name: string, appName: string): string {
  return `${zettelNr.trim()}|${name.trim()}|${appName.trim()}`
}

/**
 * Beim Öffnen des Pilot-Zettels: Eintrag im Katalog mit relativem Link zum Zugangsblatt.
 * Upsert über pilotRegKey bzw. Zettel-Nr. + Name + App-Name.
 */
export function registerPilotZettelInKatalog(input: {
  name: string
  appName: string
  pilotLinie: 'oek2' | 'vk2' | 'familie'
  zettelNr: string
  zugangsblattRelPath: string
}): void {
  try {
    ensureTestuserKatalogSeedOnce()
    const name = input.name.trim()
    const appName = input.appName.trim()
    if (!name || !appName || !input.pilotLinie) return

    const pilotRegKey = buildPilotRegKey(input.zettelNr, name, appName)
    const list = loadTestuserKatalog()
    let ix = list.findIndex((e) => e.pilotRegKey === pilotRegKey)
    if (ix < 0 && input.zettelNr.trim()) {
      ix = list.findIndex(
        (e) =>
          !e.pilotRegKey &&
          e.name === name &&
          e.appName === appName &&
          e.zettelNr === input.zettelNr.trim()
      )
    }

    if (ix >= 0) {
      updateTestuserKatalogEintrag(list[ix].id, {
        zugangsblattUrl: input.zugangsblattRelPath,
        pilotLinie: input.pilotLinie,
        zettelNr: input.zettelNr.trim(),
        pilotRegKey,
        status: 'zugang_gesendet',
      })
      return
    }

    addTestuserKatalogEintrag({
      name,
      appName,
      email: '',
      phone: '',
      notiz: 'Pilot-Zettel (automatisch)',
      status: 'zugang_gesendet',
      zugangsblattUrl: input.zugangsblattRelPath,
      pilotLinie: input.pilotLinie,
      zettelNr: input.zettelNr.trim(),
      pilotRegKey,
    })
  } catch {
    console.warn('⚠️ Pilot konnte nicht im Testuser-Katalog registriert werden')
  }
}

export function removeTestuserKatalogEintrag(id: string): TestuserKatalogEintrag[] {
  const next = loadTestuserKatalog().filter((e) => e.id !== id)
  saveTestuserKatalog(next)
  return next
}

export function updateTestuserKatalogEintrag(
  id: string,
  patch: Partial<
    Pick<
      TestuserKatalogEintrag,
      | 'name'
      | 'appName'
      | 'email'
      | 'phone'
      | 'notiz'
      | 'status'
      | 'zugangsblattUrl'
      | 'pilotLinie'
      | 'zettelNr'
      | 'pilotRegKey'
    >
  >
): TestuserKatalogEintrag[] {
  const touch = new Date().toISOString()
  const next = loadTestuserKatalog().map((e) =>
    e.id === id ? { ...e, ...patch, updatedAt: touch } : e
  )
  saveTestuserKatalog(next)
  return next
}
