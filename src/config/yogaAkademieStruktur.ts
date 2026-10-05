/**
 * Arbeitsfläche Akademie – dieselbe Hub-Form wie Absolvent:in, andere Wörter.
 * Kundentext: kein K2, keine Galerie-Marke. Muster zum Vorzeigen.
 */

import type { YogaAdminTab, YogaHubKachel } from './yogaAdminStruktur'

export const YOGA_AKADEMIE_HUB_LINKS: YogaHubKachel[] = [
  {
    emoji: '📚',
    name: 'Lehrgänge',
    beschreibung: 'Lehrgang anlegen: Name, Ort, Leitung, Termine – einmal, dann fertig.',
    tab: 'werke',
  },
  {
    emoji: '✨',
    name: 'Lehrgang-Auftritt',
    beschreibung: 'Gemeinsames Willkommen der Gruppe – QR für die Klasse.',
    tab: 'design',
  },
  {
    emoji: '⚙️',
    name: 'Akademie-Einstellungen',
    beschreibung: 'Name, Ort, Kontakt, Sicherung – das Büro der Schule.',
    tab: 'einstellungen',
  },
]

export const YOGA_AKADEMIE_HUB_RECHTS: YogaHubKachel[] = [
  {
    emoji: '👥',
    name: 'Teilnehmerlisten',
    beschreibung: 'Dieselbe Liste wie im Büro – Auftritt öffnen oder Einladung senden.',
    tab: 'statistik',
  },
  {
    emoji: '🎟️',
    name: 'Termine & Einladung',
    beschreibung: 'Lehrgangstermine und Alumni-Einladung – nur wer mitmacht, bekommt ein Haus.',
    tab: 'eventplan',
  },
]

export const YOGA_AKADEMIE_LEHRGAENGE = [
  {
    id: 'lg-wels-2026',
    title: '200h Hatha · Wels',
    note: 'März–Oktober 2026 · Leitung Mira',
    personen: 18,
    offen: 3,
    status: 'läuft',
  },
  {
    id: 'lg-graz-modul',
    title: 'Wochenendmodul · Graz',
    note: '4 Module · 2026',
    personen: 12,
    offen: 0,
    status: 'geplant',
  },
] as const

export const YOGA_AKADEMIE_TEILNEHMER = [
  { id: 't-anna', name: 'Anna', lehrgang: '200h Hatha · Wels', status: 'Auftritt offen', offen: true },
  { id: 't-mira', name: 'Mira', lehrgang: '200h Hatha · Wels', status: 'Einladung gesendet', offen: false },
  { id: 't-lea', name: 'Lea', lehrgang: '200h Hatha · Wels', status: 'im Lehrgang', offen: false },
] as const

export const YOGA_AKADEMIE_STAMMDATEN = {
  name: 'Yoga-Akademie Austria',
  ort: 'Wels · Graz · Innsbruck · online',
  kontakt: 'Büro · nach Vereinbarung',
} as const

export const YOGA_AKADEMIE_EINLADUNGEN = [
  { id: 'e-1', title: 'Alumni 2019–2024', note: 'Einladung per Link – Opt-in, keine leeren Häuser' },
  { id: 'e-2', title: 'Abschluss Wels 2026', note: 'QR mit Diplom – eigene Fläche öffnen' },
] as const

export function yogaAkademieHubTabs(): YogaAdminTab[] {
  return [...YOGA_AKADEMIE_HUB_LINKS, ...YOGA_AKADEMIE_HUB_RECHTS].map((k) => k.tab)
}
