/**
 * Kurztexte für data-muster-hint in der Musterfamilie-Demo (Hover im Leitfaden-Bereich).
 * Eine Quelle – gleiche Texte können an mehreren Stellen genutzt werden.
 */

import { PROJECT_ROUTES } from './navigation'
import { K2_FAMILIE_APP_SHORT_PATH } from '../utils/k2FamiliePwaBranding'

const R = PROJECT_ROUTES['k2-familie']

export const MUSTER_HINT_NAV_MEINE_FAMILIE =
  'Meine Familie: Einstieg mit Willkommen, Bild und Kacheln zu Stammbaum, Terminen und mehr.'

export const MUSTER_HINT_NAV_STAMMBAUM =
  'Stammbaum: Personen, Beziehungen und Generationen – in der Demo mit Beispieldaten.'

export const MUSTER_HINT_NAV_EVENTS =
  'Events verwalten: Termine anlegen und bearbeiten – Kalender-Ansicht zeigt dasselbe im Monatsraster (Button daneben).'

export const MUSTER_HINT_NAV_KALENDER =
  'Kalender-Ansicht: Jahr und Monat im Raster – Events verwalten ist ein Klick daneben, keine zweite Welt.'

export const MUSTER_HINT_NAV_GESCHICHTE =
  'Geschichten & Gedenkort: gemeinsame Texte und Erinnerungsorte.'

export const MUSTER_HINT_NAV_GEDENKORT =
  'Gedenkort: Ort oder Raum der Erinnerung – in der Demo zum Durchklicken.'

export const MUSTER_HINT_NAV_EINSTELLUNGEN =
  'Einstellungen: Zugang, Rolle, Lizenz – in echter Familie zentral, in der Demo nur Orientierung.'

export const MUSTER_HINT_NAV_HANDBUCH =
  'Handbuch: Anleitungen und Hilfe – auch ausgedruckt nutzbar.'

export const MUSTER_HINT_HOME_STAMMDATEN =
  'Meine Stammdaten: „Du“ festlegen und persönliche Angaben – Grundlage für Karte und Zugang.'

export const MUSTER_HINT_HOME_KACHEL_STAMMBAUM =
  'Zum Stammbaum: Personen anlegen, Beziehungen sehen – Demo zeigt die Idee.'

export const MUSTER_HINT_HOME_KACHEL_EVENTS_KALENDER =
  'Events & Kalender: Termine planen und im Kalender sehen – hier die Übersicht öffnen.'

export const MUSTER_HINT_HOME_KACHEL_GESCHICHTE =
  'Geschichten: längere Texte und Erzählungen der Familie – Beispiel in der Demo.'

export const MUSTER_HINT_HOME_KACHEL_GEDENKORT =
  'Gedenkort: besonderer Ort der Erinnerung – in der Musterfamilie zum Ausprobieren.'

export const MUSTER_HINT_TOOLBAR_FAMILIE =
  'Musterfamilie Huber: in der Demo nur dieser Mandant – bei euch später alle angelegten Familien auf diesem Gerät.'

export const MUSTER_HINT_TOOLBAR_LEITFADEN_BUTTON =
  'Rundgang öffnen: Schritt für Schritt durch die App – du kannst das Fenster verschieben und kleiner ziehen.'

export const MUSTER_HINT_TOOLBAR_DEMO_ENDE =
  'Beispiel beenden: zurück zur Übersicht – euren eigenen Familienraum richtet ihr mit Lizenz und Einladung ein.'

/** Nav-Link `to` → Kurztext für data-muster-hint (exakte Pfade wie in FamilieNav). */
export function musterHintForFamilieNavLink(to: string): string | undefined {
  const path = to.replace(/\/$/, '') || '/'
  const map: Record<string, string> = {
    [K2_FAMILIE_APP_SHORT_PATH]: MUSTER_HINT_NAV_MEINE_FAMILIE,
    [R.stammbaum]: MUSTER_HINT_NAV_STAMMBAUM,
    [R.events]: MUSTER_HINT_NAV_EVENTS,
    [R.kalender]: MUSTER_HINT_NAV_KALENDER,
    [R.geschichte]: MUSTER_HINT_NAV_GESCHICHTE,
    [R.gedenkort]: MUSTER_HINT_NAV_GEDENKORT,
    [R.einstellungen]: MUSTER_HINT_NAV_EINSTELLUNGEN,
    [R.benutzerHandbuch]: MUSTER_HINT_NAV_HANDBUCH,
  }
  return map[path]
}
