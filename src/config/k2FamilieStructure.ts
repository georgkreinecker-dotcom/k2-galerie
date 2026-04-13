/**
 * K2 Familie – Leitstruktur (Gruppen + Ziele) wie mök2 (mok2Structure).
 * Eine Quelle für Sidebar und ggf. aktive Zustände.
 */

import { PROJECT_ROUTES } from './navigation'

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
      { id: 'fam-home', label: 'Meine Familie', to: R.home },
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
      { id: 'fam-gesch', label: 'Geschichte', to: R.geschichte },
      { id: 'fam-gedenk', label: 'Gedenkort', to: R.gedenkort },
    ],
  },
  {
    chapterTitle: 'Lesen & Außenauftritt',
    sections: [
      { id: 'fam-handbuch', label: 'Benutzerhandbuch', to: R.benutzerHandbuch },
      { id: 'fam-praes', label: 'Präsentationsmappe', to: R.familiePraesentationsmappe },
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

/** Pfad ohne Hash – für aktiven Zustand bei Links mit Anker (#) */
export function familiePathWithoutHash(to: string): string {
  const i = to.indexOf('#')
  return i >= 0 ? to.slice(0, i) : to
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
  return pathname === pathTo || pathname.startsWith(`${pathTo}/`)
}
