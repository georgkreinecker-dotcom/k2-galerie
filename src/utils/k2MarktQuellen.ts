/**
 * K2 Markt – Quellen aus mök2 und Kampagne Marketing-Strategie.
 * Eine Quelle: daraus werden Produkt-Momente erzeugt, die dann umgesetzt werden können.
 */

import {
  PRODUCT_WERBESLOGAN,
  PRODUCT_WERBESLOGAN_2,
  PRODUCT_BOTSCHAFT_2,
  PRODUCT_ZIELGRUPPE,
  K2_STAMMDATEN_DEFAULTS,
} from '../config/tenantConfig'
import { BASE_APP_URL } from '../config/navigation'
import type { ProduktMoment, ProduktMomentKontakt } from './k2MarktFlyerAgent'

const MOK2_SLOGAN_KEY = 'k2-mok2-werbeslogan'
const MOK2_IDEEN_URL = '/k2-markt/mok2-ideen.json'

/** Eine ausgearbeitete Idee aus mök2 (Brainstorming) – medial umsetzbar. */
export interface Mok2Idee {
  id: string
  titel: string
  botschaft: string
  kernargumente?: string[]
}

/** Lädt die Liste der mök2-Ideen (ausgearbeitete Konzepte für mediale Umsetzung). */
export async function fetchMok2Ideen(): Promise<Mok2Idee[]> {
  try {
    const res = await fetch(MOK2_IDEEN_URL)
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}
const MOK2_BOTSCHAFT_KEY = 'k2-mok2-botschaft2'
const KAMPAGNE_BASE = '/kampagne-marketing-strategie'

export interface Mok2Quellen {
  slogan: string
  slogan2: string
  botschaft: string
  zielgruppe: string
}

/** Liest Slogan, Botschaft, Zielgruppe aus mök2 (tenantConfig + localStorage-Overrides). */
export function getMok2Quellen(): Mok2Quellen {
  let slogan = PRODUCT_WERBESLOGAN
  let botschaft = PRODUCT_BOTSCHAFT_2
  try {
    const v = localStorage.getItem(MOK2_SLOGAN_KEY)
    if (v && v.trim()) slogan = v.trim()
  } catch (_) {}
  try {
    const v = localStorage.getItem(MOK2_BOTSCHAFT_KEY)
    if (v && v.trim()) botschaft = v.trim()
  } catch (_) {}
  return {
    slogan,
    slogan2: PRODUCT_WERBESLOGAN_2,
    botschaft,
    zielgruppe: PRODUCT_ZIELGRUPPE,
  }
}

/** Kontakt für Moment aus Stammdaten (Galerie). Lokale Speicherung hat Vorrang. */
export function getKontaktFromStammdaten(): ProduktMomentKontakt {
  try {
    const raw = localStorage.getItem('k2-stammdaten-galerie')
    if (raw) {
      const parsed = JSON.parse(raw) as { name?: string; email?: string; phone?: string }
      return {
        name: parsed.name ?? K2_STAMMDATEN_DEFAULTS.gallery.name,
        email: parsed.email ?? K2_STAMMDATEN_DEFAULTS.gallery.email,
        phone: parsed.phone ?? K2_STAMMDATEN_DEFAULTS.gallery.phone,
      }
    }
  } catch (_) {}
  const g = K2_STAMMDATEN_DEFAULTS.gallery
  return { name: g.name, email: g.email, phone: g.phone }
}

export interface KampagneDocPreview {
  title: string
  bodyPreview: string
}

/** Holt ein Kampagnen-Dokument und extrahiert Titel (erste #-Zeile) und Vorschau (erster Absatz). */
export async function fetchKampagneDocPreview(docFile: string): Promise<KampagneDocPreview | null> {
  try {
    const res = await fetch(`${KAMPAGNE_BASE}/${docFile}`)
    if (!res.ok) return null
    const text = await res.text()
    const lines = text.split('\n')
    let title = 'Aus Kampagne'
    let bodyPreview = ''
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line.startsWith('# ')) {
        title = line.slice(2).trim()
        continue
      }
      if (line.startsWith('## ') || line.startsWith('### ')) break
      const t = line.trim()
      if (t && !t.startsWith('*') && !t.startsWith('-')) {
        bodyPreview = t
        if (bodyPreview.length > 280) bodyPreview = bodyPreview.slice(0, 277) + '…'
        break
      }
    }
    return { title, bodyPreview }
  } catch {
    return null
  }
}

/** Baut ein Produkt-Moment aus mök2- und optionalen Kampagne-Quellen. Optional: Basis = eine mök2-Idee (Brainstorming). */
export function buildMomentFromQuellen(options: {
  mok2: Mok2Quellen
  kontakt: ProduktMomentKontakt
  kampagne?: KampagneDocPreview | null
  /** Ausgearbeitete mök2-Idee als Basis (Titel, Botschaft, Kernargumente). */
  mok2Idee?: Mok2Idee | null
  id?: string
  links?: string[]
  withSource?: boolean
  kampagneDocFile?: string
}): ProduktMoment {
  const { mok2, kontakt, kampagne, mok2Idee, links, withSource, kampagneDocFile } = options
  const id = options.id ?? `moment-${Date.now()}`
  const titel = kampagne?.title ?? (mok2Idee?.titel ?? 'Aus mök2 & Kampagne')
  const basisBotschaft = mok2Idee?.botschaft
    ? `${mok2Idee.botschaft}\n\n${mok2.slogan}\n${mok2.slogan2}`
    : kampagne?.bodyPreview
      ? `${kampagne.bodyPreview}\n\n${mok2.slogan}\n${mok2.slogan2}`
      : `${mok2.slogan}\n${mok2.slogan2}\n\n${mok2.botschaft}`
  const kernargumente = (mok2Idee?.kernargumente?.length
    ? [...mok2Idee.kernargumente]
    : [mok2.slogan, mok2.slogan2]
  ).filter(Boolean)
  return {
    id,
    titel,
    botschaft: basisBotschaft,
    zielgruppe: mok2.zielgruppe,
    kontakt,
    links: links ?? [`${BASE_APP_URL}/willkommen`],
    medien: [],
    kernargumente,
    gültigVon: null,
    gültigBis: null,
    ...(withSource && kampagneDocFile !== undefined && { source: { kampagneDoc: kampagneDocFile || undefined } }),
  }
}

/** Holt immer aktuellen Moment aus Quellen. Basis = mök2-Idee (Brainstorming) oder nur Slogan; optional Kampagne. */
export async function getMomentFromQuellenLive(options?: {
  mok2IdeenId?: string
  kampagneDoc?: string
}): Promise<ProduktMoment> {
  const mok2 = getMok2Quellen()
  const kontakt = getKontaktFromStammdaten()
  const kampagneDoc = options?.kampagneDoc
  const kampagne = kampagneDoc ? await fetchKampagneDocPreview(kampagneDoc) : null
  let mok2Idee: Mok2Idee | null = null
  const ideenId = options?.mok2IdeenId
  if (ideenId && ideenId !== 'nur-slogan') {
    const ideen = await fetchMok2Ideen()
    mok2Idee = ideen.find((i) => i.id === ideenId) ?? null
  }
  const id = `live-${ideenId || 'mok2'}-${kampagneDoc || ''}`.replace(/\./g, '-').replace(/-+$/, '') || 'live-mok2'
  return buildMomentFromQuellen({ mok2, kontakt, kampagne, mok2Idee, id })
}
