/**
 * GlobaleGuideBegleitung – Georg 20.03.26
 *
 * Der globale schwarze Hub-Guide (Stations-Dialog über alle Seiten) ist **abgeschaltet** –
 * er hat in der APf (iframe + gleicher Speicher) zu Doppel-Anzeige und Durcheinander geführt.
 *
 * Diese Datei behält **Typen** und **localStorage-Helfer** (`beendeGuideFlow`, …), damit
 * bestehende Aufräum-Logik und ggf. URL-Parameter (vorname/pfad) nicht brechen.
 * Die React-Komponente rendert absichtlich nichts.
 */

export type GuidePfad = 'kuenstlerin' | 'gemeinschaft' | 'atelier' | 'entdecker' | ''

export type GuideContext = 'oeffentlich' | 'vk2'

export interface GuideFlowState {
  aktiv: boolean
  name: string
  pfad: GuidePfad
  schritt: string
  erledigte: string[]
  /** Kontext wie in ök2: oeffentlich = Demo-Galerie, vk2 = Vereinsgalerie */
  context?: GuideContext
}

const FLOW_KEY = 'k2-guide-flow'

export function ladeGuideFlow(): GuideFlowState | null {
  try {
    const v = localStorage.getItem(FLOW_KEY)
    if (!v) return null
    const f = JSON.parse(v) as GuideFlowState
    if (!f.aktiv) return null
    if (f.context !== 'vk2' && f.context !== 'oeffentlich') f.context = 'oeffentlich'
    return f
  } catch {
    return null
  }
}

export function speichereGuideFlow(f: GuideFlowState) {
  try {
    localStorage.setItem(FLOW_KEY, JSON.stringify(f))
  } catch {
    /* ignore */
  }
}

/** Flow beenden (aktiv: false). Wird z. B. von Galerie-Landing und App-Start genutzt. */
export function beendeGuideFlow() {
  try {
    const v = localStorage.getItem(FLOW_KEY)
    if (v) {
      const f = JSON.parse(v) as GuideFlowState
      f.aktiv = false
      localStorage.setItem(FLOW_KEY, JSON.stringify(f))
    }
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent('guide-flow-update'))
}

/** Absichtlich leer – globaler Guide wird nicht mehr gemountet (siehe App.tsx). */
export function GlobaleGuideBegleitung() {
  return null
}
