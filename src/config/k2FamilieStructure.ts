/**
 * K2 Familie – Leitstruktur (Gruppen + Ziele) wie mök2 (mok2Structure).
 * Eine Quelle für Sidebar und ggf. aktive Zustände.
 */

import { PROJECT_ROUTES } from './navigation'
import { K2_FAMILIE_APP_SHORT_PATH } from '../utils/k2FamiliePwaBranding'
import { K2_FAMILIE_NAV_LABEL_GESCHICHTE } from './k2FamilieNavLabels'

const R = PROJECT_ROUTES['k2-familie']

export type FamilieLeitSection = { id: string; label: string; to: string }

export type FamilieLeitGroup = {
  chapterTitle: string
  sections: FamilieLeitSection[]
}

/** Gruppierte Navigation – Reihenfolge = Leselogik */
export const k2FamilieLeitGroups: FamilieLeitGroup[] = [
  {
    chapterTitle: 'Start & Orientierung',
    sections: [
      { id: 'fam-willkommen', label: 'Einstiegsseite (Flyer/QR)', to: R.willkommen },
      { id: 'fam-einstieg', label: 'Musterfamilie (Umschauen)', to: `${R.meineFamilie}?t=huber` },
      { id: 'fam-home', label: 'Meine Familie', to: K2_FAMILIE_APP_SHORT_PATH },
      { id: 'fam-uebersicht', label: 'Projekt & Leitbild', to: `${R.uebersicht}#k2-familie-lizenz-bruecke` },
    ],
  },
  {
    chapterTitle: 'Stammbaum & Struktur',
    sections: [
      { id: 'fam-stammbaum', label: 'Stammbaum', to: R.stammbaum },
      { id: 'fam-grund', label: 'Grundstruktur', to: R.grundstruktur },
    ],
  },
  {
    chapterTitle: 'Momente & Zeit',
    sections: [
      { id: 'fam-events', label: 'Events', to: R.events },
      { id: 'fam-kal', label: 'Kalender', to: R.kalender },
      { id: 'fam-gesch', label: K2_FAMILIE_NAV_LABEL_GESCHICHTE, to: R.geschichte },
      { id: 'fam-gedenk', label: 'Gedenkort', to: R.gedenkort },
    ],
  },
  {
    chapterTitle: 'Lesen & Außenauftritt',
    sections: [{ id: 'fam-handbuch', label: 'Benutzerhandbuch', to: R.benutzerHandbuch }],
  },
  {
    chapterTitle: 'K2 Familien Marketing',
    sections: [
      { id: 'fam-mkt-konzept', label: 'Marketingkonzept', to: `${R.familienMarketing}#fam-mkt-konzept` },
      { id: 'fam-mkt-ueberblick', label: 'Überblick', to: `${R.familienMarketing}#fam-mkt-ueberblick` },
      { id: 'fam-mkt-usp', label: 'USP & Positionierung', to: `${R.familienMarketing}#fam-mkt-usp` },
      { id: 'fam-mkt-mitbewerb', label: 'Produktvergleich', to: `${R.familienMarketing}#fam-mkt-mitbewerb` },
      { id: 'fam-mkt-markt', label: 'Marktanalyse', to: `${R.familienMarketing}#fam-mkt-markt` },
      { id: 'fam-mkt-preis', label: 'Preis & Lizenz (10 €)', to: `${R.familienMarketing}#fam-mkt-preis` },
      { id: 'fam-mkt-ziel', label: 'Zielgruppe & Kanäle', to: `${R.familienMarketing}#fam-mkt-zielgruppe` },
      { id: 'fam-mkt-abgrenzung', label: 'Abgrenzung', to: `${R.familienMarketing}#fam-mkt-abgrenzung` },
      { id: 'fam-mkt-tonfall', label: 'Tonfall', to: `${R.familienMarketing}#fam-mkt-tonfall` },
    ],
  },
  {
    chapterTitle: 'Entwicklung & Sicherheit',
    sections: [
      { id: 'fam-doku', label: 'Doku (Entwicklung)', to: R.entwicklungDoku },
      { id: 'fam-sich', label: 'Sicherung', to: R.sicherung },
    ],
  },
]

/** Pfad ohne Query und Hash – für aktiven Zustand bei Links mit ?t=… oder Anker (#) */
export function familiePathWithoutHash(to: string): string {
  let s = to
  const qi = s.indexOf('?')
  if (qi >= 0) s = s.slice(0, qi)
  const hi = s.indexOf('#')
  return hi >= 0 ? s.slice(0, hi) : s
}

/** Aktiver Eintrag: eine Regel für horizontale Nav und Leitstruktur-Panel */
export function isFamilieNavSectionActive(pathname: string, to: string): boolean {
  const pathTo = familiePathWithoutHash(to)
  if (pathTo === R.home) {
    return pathname === R.home || pathname === `${R.home}/`
  }
  if (pathTo === R.benutzerHandbuch) {
    return pathname === R.benutzerHandbuch || pathname.startsWith(`${R.benutzerHandbuch}/`)
  }
  if (pathTo === R.stammbaum) {
    return pathname.startsWith(R.stammbaum) || pathname.startsWith(`${R.home}/personen`)
  }
  if (pathTo === R.familienMarketing) {
    return pathname === R.familienMarketing || pathname.startsWith(`${R.familienMarketing}/`)
  }
  return pathname === pathTo || pathname.startsWith(`${pathTo}/`)
}
