/**
 * EINZIGE Schicht für „Server-Daten anwenden“ (Aktuellen Stand holen, Vom Server laden).
 * Alle Aufrufer (GaleriePage, Admin, GalerieVorschauPage) MÜSSEN diese Funktionen nutzen.
 * Kein direktes saveEvents/saveDocuments/localStorage.setItem für K2-Listen/Design/PageTexts
 * mit Server-Daten ohne diese Schicht – sonst Überschreibungen und Datenverlust.
 *
 * Regeln (generell):
 * - Listen (Events, Dokumente): Nie mit weniger Einträgen überschreiben; pro Eintrag lokale
 *   „reichere“ Daten erhalten, wenn Server denselben Eintrag mit leereren Feldern liefert.
 * - Design: Nur übernehmen, wenn Server ein sinnvolles Design hat UND lokal keins hat.
 * - PageTexts: Nur übernehmen, wenn Server sinnvolle PageTexts hat; sonst lokal behalten.
 * Doku: docs/PROZESS-VEROEFFENTLICHEN-LADEN.md, docs/KRITISCHE-ABLAEUFE.md §3.
 */

import { mergeEventTimesFromLocal } from './eventsStorage'

const K2_ORANGE_DESIGN = {
  backgroundColor1: '#1c1210',
  backgroundColor2: '#2a1e1a',
  backgroundColor3: '#3d2c26',
  textColor: '#fdf6f2',
  mutedColor: '#c49a88',
  accentColor: '#d97a50',
  cardBg1: 'rgba(45, 34, 30, 0.95)',
  cardBg2: 'rgba(28, 20, 18, 0.92)'
}

const OLD_BLUE_BG = ['#0a0e27', '#03040a', '#1a1f3a', '#0d1426', '#111c33', '#0f1419']
const OLD_CYAN_ACCENT = ['#5ffbf1', '#33a1ff', '#667eea', '#764ba2', '#b8b8ff', '#8fa0c9']
const BLUE_BG_PATTERNS = ['0a0e', '1a1f', '0d14', '111c', '0304', '0f14', '1426', '0e27', '1f3a', '0a0f', '1a2a']
const BLUE_ACCENT_PATTERNS = ['5ff', '33a', '667', '764', 'b8b', '8fa', 'a1f', 'eea', 'bfb', '1ff', '0ff', '7ee', '4ba2', 'c4e', 'add8e6', '87ceeb', '00bfff', '1e90ff']

function isOldBlueTheme(design: Record<string, string> | null | undefined): boolean {
  if (!design || typeof design !== 'object') return true
  const norm = (s: string) => (s || '').toLowerCase().trim().replace(/\s/g, '')
  const bg1 = norm(design.backgroundColor1)
  const bg2 = norm(design.backgroundColor2)
  const accent = norm(design.accentColor)
  if (OLD_BLUE_BG.some(b => b === bg1 || b === bg2)) return true
  if (OLD_CYAN_ACCENT.some(c => c === accent)) return true
  if (BLUE_BG_PATTERNS.some(p => bg1.includes(p) || bg2.includes(p))) return true
  if (BLUE_ACCENT_PATTERNS.some(p => accent.includes(p))) return true
  return false
}

export function hasMeaningfulDesign(design: unknown): design is Record<string, string> {
  if (!design || typeof design !== 'object') return false
  const d = design as Record<string, string>
  return Boolean((d.accentColor && d.accentColor.trim()) || (d.backgroundColor1 && d.backgroundColor1.trim()))
}

export function getDesignToApply(serverDesign: unknown, localDesign: unknown): Record<string, string> | null {
  if (!hasMeaningfulDesign(serverDesign)) return null
  if (hasMeaningfulDesign(localDesign)) return null
  const use = isOldBlueTheme(serverDesign as Record<string, string>) ? K2_ORANGE_DESIGN : (serverDesign as Record<string, string>)
  return use
}

/** Events: Nur anwenden wenn Server mindestens so viele hat wie lokal; Zeiten aus lokal erhalten. */
export function applyServerEvents(serverEvents: unknown, localEvents: any[]): any[] | null {
  const server = Array.isArray(serverEvents) ? serverEvents : []
  const local = Array.isArray(localEvents) ? localEvents : []
  if (server.length < local.length) return null
  if (server.length === 0) return null
  return mergeEventTimesFromLocal(server, local)
}

/** Dokumente: Nur anwenden wenn Server mindestens so viele hat wie lokal; pro Dokument lokale reichere Felder erhalten. */
export function applyServerDocuments(serverDocuments: unknown, localDocuments: any[]): any[] | null {
  const server = Array.isArray(serverDocuments) ? serverDocuments : []
  const local = Array.isArray(localDocuments) ? localDocuments : []
  if (server.length < local.length) return null
  if (server.length === 0) return null
  const localById = new Map<string, any>()
  local.forEach((d: any) => { if (d?.id) localById.set(String(d.id), d) })
  const merged = server.map((sd: any) => {
    const loc = sd?.id ? localById.get(String(sd.id)) : null
    if (!loc) return sd
    const serverEmptyUrl = !sd.documentUrl || (typeof sd.documentUrl === 'string' && !sd.documentUrl.trim())
    const localHasUrl = !!(loc.documentUrl && typeof loc.documentUrl === 'string' && loc.documentUrl.trim())
    const serverEmptyContent = !sd.content || (typeof sd.content === 'string' && !sd.content.trim())
    const localHasContent = !!(loc.content && (typeof loc.content === 'string' ? loc.content.trim() : true))
    if ((serverEmptyUrl && localHasUrl) || (serverEmptyContent && localHasContent)) {
      return {
        ...sd,
        documentUrl: (sd.documentUrl && String(sd.documentUrl).trim()) || loc.documentUrl || '',
        content: (sd.content != null && (typeof sd.content !== 'string' || sd.content.trim())) ? sd.content : (loc.content ?? sd.content)
      }
    }
    return sd
  })
  return merged
}

/** PageTexts: Nur anwenden wenn Server sinnvolle Daten hat (nicht leer/null); sonst null = nicht überschreiben. */
export function applyServerPageTexts(serverPageTexts: unknown, localPageTexts: unknown): Record<string, unknown> | null {
  if (serverPageTexts == null) return null
  if (typeof serverPageTexts !== 'object') return null
  const server = serverPageTexts as Record<string, unknown>
  const keys = Object.keys(server)
  if (keys.length === 0) return null
  const hasAnyContent = keys.some(k => {
    const v = server[k]
    if (v == null) return false
    if (typeof v === 'string') return v.trim().length > 0
    if (typeof v === 'object') return Object.keys(v as object).length > 0
    return true
  })
  if (!hasAnyContent) return null
  const local = (localPageTexts && typeof localPageTexts === 'object') ? (localPageTexts as Record<string, unknown>) : {}
  const merged = { ...local }
  keys.forEach(k => {
    const v = server[k]
    if (v != null && ((typeof v === 'string' && (v as string).trim()) || (typeof v === 'object' && Object.keys(v as object).length > 0))) {
      merged[k] = v
    }
  })
  return merged
}

export interface ApplyServerPayloadK2Result {
  events: any[] | null
  documents: any[] | null
  designSettings: Record<string, string> | null
  pageTexts: Record<string, unknown> | null
}

/**
 * Einziger Einstieg: Server-Payload (z. B. aus gallery-data) + lokale Daten → was angewendet werden darf.
 * null = nicht überschreiben (lokal behalten).
 */
export function applyServerPayloadK2(
  serverData: Record<string, unknown>,
  local: {
    events: any[]
    documents: any[]
    designSettings: unknown
    pageTexts: unknown
  }
): ApplyServerPayloadK2Result {
  return {
    events: applyServerEvents(serverData.events, local.events),
    documents: applyServerDocuments(serverData.documents, local.documents),
    designSettings: getDesignToApply(serverData.designSettings, local.designSettings),
    pageTexts: applyServerPageTexts(serverData.pageTexts, local.pageTexts)
  }
}
