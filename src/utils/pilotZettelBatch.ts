/**
 * Mehrere Pilot-Zettel aus einer Bewerbung (ök2 + VK2 + K2 Familie) – eine Quelle wie ZettelPilotFormPage.
 */

import { BASE_APP_URL, K2_FAMILIE_WILLKOMMEN_ROUTE } from '../config/navigation'
import { buildFamiliePilotWillkommenUrl } from './familiePilotSeed'
import { buildOek2PilotGalerieUrl } from './pilotOek2GalerieUrl'
import { getNextPilotZettelNr, setLastPilotZettelNr } from './pilotZettelNr'
import {
  registerPilotZettelInKatalog,
  updateTestuserKatalogEintrag,
  loadTestuserKatalog,
  type TestuserKatalogEintrag,
} from './testuserKatalogStorage'
import { toAbsolutePilotShareUrl } from './pilotInviteClient'
import { buildVk2PilotGalerieUrl } from './vk2PilotUrls'

const FAMILIE_URL = BASE_APP_URL + K2_FAMILIE_WILLKOMMEN_ROUTE

export type PilotLinie = 'oek2' | 'vk2' | 'familie'

export type CreatedPilotZettel = {
  linie: PilotLinie
  zettelNr: string
  zugangsblattUrl: string
  absoluteUrl: string
}

function buildPilotUrl(linie: PilotLinie, appName: string, zettelNr: string): string {
  if (linie === 'oek2') return buildOek2PilotGalerieUrl(appName)
  if (linie === 'vk2') return buildVk2PilotGalerieUrl(zettelNr)
  return buildFamiliePilotWillkommenUrl(FAMILIE_URL, appName, zettelNr)
}

/** Relativer Pfad /zettel-pilot?… – wie nach „Laufzettel generieren“ */
export function buildZettelPilotRelPath(input: {
  name: string
  appName: string
  linie: PilotLinie
  zettelNr: string
}): string {
  const pilotUrl = buildPilotUrl(input.linie, input.appName.trim(), input.zettelNr)
  const params = new URLSearchParams()
  params.set('name', input.name.trim())
  params.set('appName', input.appName.trim())
  params.set('type', input.linie)
  params.set('pilotUrl', pilotUrl)
  if (input.zettelNr.trim()) params.set('nr', input.zettelNr.trim())
  return `/zettel-pilot?${params.toString()}`
}

/** Relativer Zugangsblatt-Pfad → absolute URL für E-Mail / externe Empfänger (nie localhost von der APf). */
export function absoluteZugangsblattUrl(relativePath: string): string {
  return toAbsolutePilotShareUrl(relativePath)
}

/**
 * Legt für jede Linie einen Katalog-Eintrag mit Zugangsblatt-Link an (ohne Zettel-Seite zu öffnen).
 */
export function createPilotZettelsForBewerbung(input: {
  name: string
  appName: string
  email: string
  phone?: string
  linien: PilotLinie[]
}): CreatedPilotZettel[] {
  const name = input.name.trim()
  const appName = input.appName.trim()
  if (!name || !appName || input.linien.length === 0) return []

  const created: CreatedPilotZettel[] = []

  for (const linie of input.linien) {
    const zettelNr = getNextPilotZettelNr()
    const zugangsblattUrl = buildZettelPilotRelPath({ name, appName, linie, zettelNr })
    registerPilotZettelInKatalog({
      name,
      appName,
      pilotLinie: linie,
      zettelNr,
      zugangsblattRelPath: zugangsblattUrl,
    })
    if (input.email.trim()) {
      const regKey = `${zettelNr}|${name}|${appName}`
      const row = loadTestuserKatalog().find((e) => e.pilotRegKey === regKey)
      if (row) {
        updateTestuserKatalogEintrag(row.id, {
          email: input.email.trim(),
          phone: input.phone?.trim() || row.phone,
          notiz: 'Pilot-Zettel (aus Anmeldung)',
          status: 'bewerbung',
        })
      }
    }
    setLastPilotZettelNr(zettelNr)
    created.push({
      linie,
      zettelNr,
      zugangsblattUrl,
      absoluteUrl: absoluteZugangsblattUrl(zugangsblattUrl),
    })
  }
  return created
}

const LINIE_LABEL: Record<PilotLinie, string> = {
  oek2: 'ök2 (Demo)',
  vk2: 'VK2 (Verein)',
  familie: 'K2 Familie',
}

/** Katalog-Zeile → Zugangsblatt für mailto (nur wenn Link + Linie vorhanden) */
export function katalogEintragToCreatedZettel(row: TestuserKatalogEintrag): CreatedPilotZettel | null {
  const url = row.zugangsblattUrl?.trim()
  const linie = row.pilotLinie
  if (!url || !linie || !row.zettelNr?.trim()) return null
  return {
    linie,
    zettelNr: row.zettelNr.trim(),
    zugangsblattUrl: url,
    absoluteUrl: toAbsolutePilotShareUrl(url),
  }
}

export function buildZugangMailtoForKatalogRows(rows: TestuserKatalogEintrag[]): string | null {
  const name = rows[0]?.name?.trim()
  const email = rows[0]?.email?.trim()
  if (!name || !email?.includes('@')) return null
  const zettels = rows
    .map(katalogEintragToCreatedZettel)
    .filter((z): z is CreatedPilotZettel => z !== null)
    .sort((a, b) => parseInt(a.zettelNr, 10) - parseInt(b.zettelNr, 10))
  if (zettels.length === 0) return null
  return buildZugangMailtoForTestuser({ email, name, zettels })
}

/** Nach tatsächlichem Versand: Stand in der Mappe setzen */
export function markKatalogRowsZugangGesendet(rowIds: string[]): void {
  for (const id of rowIds) {
    updateTestuserKatalogEintrag(id, { status: 'zugang_gesendet' })
  }
}

/** Personen mit gleicher E-Mail (für Sammel-E-Mail aus der Tabelle) */
export function groupKatalogRowsByEmail(rows: TestuserKatalogEintrag[]): TestuserKatalogEintrag[][] {
  const map = new Map<string, TestuserKatalogEintrag[]>()
  for (const row of rows) {
    const em = row.email?.trim().toLowerCase()
    if (!em || !em.includes('@')) continue
    const cur = map.get(em) ?? []
    cur.push(row)
    map.set(em, cur)
  }
  return [...map.values()].map((g) =>
    g.sort((a, b) => parseInt(a.zettelNr || '0', 10) - parseInt(b.zettelNr || '0', 10)),
  )
}

/** mailto an Testuser mit allen Zugangsblatt-Links – kein PDF nötig */
export function buildZugangMailtoForTestuser(input: {
  email: string
  name: string
  zettels: CreatedPilotZettel[]
}): string {
  const lines = input.zettels.map(
    (z) => `${LINIE_LABEL[z.linie]} (Zettel ${z.zettelNr}):\n${z.absoluteUrl}`,
  )
  const body = [
    `Hallo ${input.name.trim()},`,
    '',
    'hier sind Ihre persönlichen Test-Zugänge zu kgm solution:',
    '',
    ...lines,
    '',
    'Öffnen Sie jeden Link im Browser (Handy oder Computer). Auf dem Zugangsblatt finden Sie QR-Code und Kurzanleitung.',
    '',
    'Bei Fragen antworten Sie einfach auf diese E-Mail.',
    '',
    'Herzliche Grüße',
    'kgm solution',
  ].join('\n')
  const subject = encodeURIComponent('Ihre Test-Zugänge – kgm solution')
  const bodyEnc = encodeURIComponent(body)
  return `mailto:${encodeURIComponent(input.email.trim())}?subject=${subject}&body=${bodyEnc}`
}
