/**
 * K2 Familie – Leitstruktur (Gruppen + Ziele) wie mök2 (mok2Structure).
 * Eine Quelle für Sidebar und ggf. aktive Zustände.
 */

import { PROJECT_ROUTES } from './navigation'
import { isK2FamilieMeineFamilieHomePath, K2_FAMILIE_APP_SHORT_PATH } from '../utils/k2FamiliePwaBranding'
import { FAMILIE_HUBER_TENANT_ID, getMusterfamilieHuberMeineFamiliePathWithQuery } from '../data/k2FamilieMusterHuberQuelle'
import { K2_FAMILIE_NAV_LABEL_GESCHICHTE } from './k2FamilieNavLabels'

const R = PROJECT_ROUTES['k2-familie']

export type FamilieLeitSection = { id: string; label: string; to: string }

export type FamilieLeitGroup = {
  chapterTitle: string
  sections: FamilieLeitSection[]
}

/** Vorderteil der Leitstruktur (bis inkl. Benutzerhandbuch) */
const k2FamilieLeitGroupsHead: FamilieLeitGroup[] = [
  {
    chapterTitle: 'Start & Orientierung',
    sections: [
      { id: 'fam-willkommen', label: 'Einstiegsseite (Flyer/QR)', to: R.willkommen },
      { id: 'fam-einstieg', label: 'Musterfamilie (Umschauen)', to: getMusterfamilieHuberMeineFamiliePathWithQuery() },
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
]

/** Eigenständiger Bereich wie bei mök2 (ein Ordner, eine Lesefassung) – nur K2-Familie-Inhalt, keine Galerie-Vertriebslinks. */
const k2FamilieProspekteGruppe: FamilieLeitGroup = {
  chapterTitle: 'Prospekte & Präsentationsmappen',
  sections: [
    { id: 'fam-prop-mappe-kunde', label: 'K2 Familie – Präsentationsmappe (Kunde)', to: R.familiePraesentationsmappeKunde },
    { id: 'fam-prop-k2fam', label: 'K2 Familie – Vertriebsunterlagen (intern)', to: R.familiePraesentationsmappe },
  ],
}

const k2FamilieLeitGroupsTail: FamilieLeitGroup[] = [
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

/** Leitstruktur-Sidebar inkl. eigener Gruppe „Prospekte & Präsentationsmappen“ (nur K2 Familie). */
export function getK2FamilieLeitGroups(): FamilieLeitGroup[] {
  return [...k2FamilieLeitGroupsHead, k2FamilieProspekteGruppe, ...k2FamilieLeitGroupsTail]
}

/** Snapshot beim Modulstart – für Tests/Imports; UI: getK2FamilieLeitGroups() */
export const k2FamilieLeitGroups: FamilieLeitGroup[] = getK2FamilieLeitGroups()

/** Pfad ohne Query und Hash – für aktiven Zustand bei Links mit ?t=… oder Anker (#) */
export function familiePathWithoutHash(to: string): string {
  let s = to
  const qi = s.indexOf('?')
  if (qi >= 0) s = s.slice(0, qi)
  const hi = s.indexOf('#')
  return hi >= 0 ? s.slice(0, hi) : s
}

function getTenantTFromLinkString(to: string): string {
  const q = to.indexOf('?')
  if (q < 0) return ''
  const after = to.slice(q + 1)
  const h = after.indexOf('#')
  return new URLSearchParams(h >= 0 ? after.slice(0, h) : after).get('t')?.toLowerCase().trim() ?? ''
}

function parseTFromSearch(search: string): string {
  if (!search) return ''
  const raw = search.startsWith('?') ? search.slice(1) : search
  return new URLSearchParams(raw).get('t')?.toLowerCase().trim() ?? ''
}

/**
 * Aktiver Eintrag: eine Regel für horizontale Nav und Leitstruktur-Panel.
 * `search` = `location.search` (z. B. `?t=huber`), damit **Musterfamilie** (`…/meine-familie?t=huber`)
 * und **Meine Familie** (gleicher Pfad ohne / mit anderem `t`) sich nicht gegenseitig fälschlich markieren.
 */
export function isFamilieNavSectionActive(
  pathname: string,
  to: string,
  search: string = '',
): boolean {
  const pathTo = familiePathWithoutHash(to)
  const tCurrent = parseTFromSearch(search)
  const tInLink = getTenantTFromLinkString(to)

  // Musterfamilie (Umschauen) → nur wenn URL wirklich t=huber
  if (pathTo === R.meineFamilie && tInLink === FAMILIE_HUBER_TENANT_ID) {
    return isK2FamilieMeineFamilieHomePath(pathname) && tCurrent === FAMILIE_HUBER_TENANT_ID
  }

  // Meine Familie (Kurz-URL) – /familie ODER lange meine-familie, aber nicht die Huber-Demo
  if (pathTo === K2_FAMILIE_APP_SHORT_PATH) {
    if (!isK2FamilieMeineFamilieHomePath(pathname)) return false
    return tCurrent !== FAMILIE_HUBER_TENANT_ID
  }

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
