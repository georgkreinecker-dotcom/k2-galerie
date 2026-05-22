/**
 * Mehrere Pilot-Zettel aus einer Bewerbung (ök2 + VK2 + K2 Familie) – eine Quelle wie ZettelPilotFormPage.
 */

import { BASE_APP_URL, K2_FAMILIE_WILLKOMMEN_ROUTE } from '../config/navigation'
import { buildFamiliePilotWillkommenUrl } from './familiePilotSeed'
import { buildOek2PilotGalerieUrl } from './pilotOek2GalerieUrl'
import { getNextPilotZettelNr, setLastPilotZettelNr } from './pilotZettelNr'
import { registerPilotZettelInKatalog, updateTestuserKatalogEintrag, loadTestuserKatalog } from './testuserKatalogStorage'
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

function originForAbsoluteUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin
  return BASE_APP_URL
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
  const origin = originForAbsoluteUrl()

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
          status: 'zugang_gesendet',
        })
      }
    }
    setLastPilotZettelNr(zettelNr)
    created.push({
      linie,
      zettelNr,
      zugangsblattUrl,
      absoluteUrl: `${origin}${zugangsblattUrl}`,
    })
  }
  return created
}

const LINIE_LABEL: Record<PilotLinie, string> = {
  oek2: 'ök2 (Demo)',
  vk2: 'VK2 (Verein)',
  familie: 'K2 Familie',
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
