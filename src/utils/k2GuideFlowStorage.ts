/**
 * k2-guide-flow (localStorage) – **eine Quelle** für den Flow-Status.
 *
 * Wird u. a. vom **grünen Orientierungs-Balken** im Admin (ök2/VK2) genutzt.
 * Das ist **kein** UI – nur Typen + lesen/schreiben.
 *
 * Der frühere schwarze Vollbild-Guide (historisch „GlobaleGuideBegleitung“) ist abgeschaltet;
 * die Komponente dazu bleibt leer, siehe `GlobaleGuideBegleitung.tsx`.
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

/** Flow beenden (aktiv: false). z. B. GalerieEntdeckenGuide beim Start der Landing-Seite. */
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
