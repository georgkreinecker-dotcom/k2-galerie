/**
 * Eiserne Sperre: Besucher dürfen nirgends in der App Eingaben vornehmen, die Galerie-/Stammdaten/Design/Works/Events etc. verändern.
 * Nur erlaubte Ausnahme: Kunden-Eingaben im Shop (Warenkorb, Bestellung).
 *
 * Diese Hilfsfunktion prüft, ob der aktuelle Kontext ein "Besucher-Kontext" ist (dann keine Bearbeitungs-UI anzeigen).
 * Quelle: .cursor/rules/eiserne-regel-besucher-keine-eingaben.mdc, docs/SICHERHEIT-BESUCHER-KEINE-EINGABEN.md
 */

export type VisitorCheckState = {
  fromAdmin?: boolean
  fromApf?: boolean
  fromAdminTab?: boolean
  fromOeffentlich?: boolean
}

/**
 * Gibt true zurück, wenn der Nutzer ein "Besucher" ist – also keine Berechtigung hat,
 * Galerie-Texte, -Bilder, Werke, Events, Stammdaten, Design o.ä. zu ändern.
 * Dann darf keine Bearbeitungs-UI (Eingabefelder, Speichern-Buttons) angezeigt werden.
 *
 * Erlaubt (darf bearbeiten): Admin, APf, von Admin/APf kommend, VK2 eingeloggt.
 */
export function isVisitorContext(locationState?: VisitorCheckState | null): boolean {
  try {
    if (typeof sessionStorage === 'undefined') return true
    const state = locationState ?? {}
    if (state.fromAdmin === true) return false
    if (state.fromApf === true) return false
    if (state.fromAdminTab === true) return false
    if (sessionStorage.getItem('k2-admin-context')) return false
    if (sessionStorage.getItem('k2-oek2-from-apf') === '1') return false
    if (sessionStorage.getItem('k2-vk2-mitglied-eingeloggt')) return false
    if (sessionStorage.getItem('k2-galerie-from-admin') === '1') return false
    if (typeof document !== 'undefined' && document.referrer) {
      const ref = document.referrer
      if (ref.includes('/admin') || ref.includes('mission-control') || ref.includes('mein-bereich')) return false
      if (ref.includes('/projects/k2-galerie') && !ref.endsWith('/galerie') && !ref.endsWith('/galerie/')) return false
    }
    return true
  } catch {
    return true
  }
}

/** Kurz: Darf der Nutzer hier Inhalte bearbeiten (Texte, Bilder, Stammdaten, …)? */
export function mayEditContent(locationState?: VisitorCheckState | null): boolean {
  return !isVisitorContext(locationState)
}
