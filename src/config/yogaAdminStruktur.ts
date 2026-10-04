/**
 * Eine Quelle: Admin-Hub für Yogabetrieb = dieselbe K2-Struktur (Tabs + Reihenfolge), andere Wörter.
 * Keine K2-Werke/Stammdaten.
 */

export type YogaAdminTab =
  | 'werke'
  | 'design'
  | 'einstellungen'
  | 'statistik'
  | 'eventplan'
  | 'kassa'
  | 'buchhaltung'

export type YogaHubKachel = {
  emoji: string
  name: string
  beschreibung: string
  tab: YogaAdminTab
}

/** Links wie K2: Werke → Gestalten → Einstellungen */
export const YOGA_ADMIN_HUB_LINKS: YogaHubKachel[] = [
  {
    emoji: '🧘',
    name: 'Stunden & Angebote',
    beschreibung: 'Foto, Titel und Preis – ein Klick, und die Stunde steht im Auftritt.',
    tab: 'werke',
  },
  {
    emoji: '✨',
    name: 'Auftritt gestalten und texten',
    beschreibung: 'Farben, Texte, Willkommen – so sieht dich die Welt.',
    tab: 'design',
  },
  {
    emoji: '⚙️',
    name: 'Einstellungen',
    beschreibung: 'Name, Ort, Kontakt, Backup – wie bei der Galerie.',
    tab: 'einstellungen',
  },
]

/** Rechts wie K2: Statistik/Katalog → Event- und Medienplanung */
export const YOGA_ADMIN_HUB_RECHTS: YogaHubKachel[] = [
  {
    emoji: '📋📊',
    name: 'Listen & Übersicht',
    beschreibung: 'Stunden, Belegung, druckbare Liste – alles an einem Ort.',
    tab: 'statistik',
  },
  {
    emoji: '🎟️',
    name: 'Termine & Medienplanung',
    beschreibung: 'Kurse planen, Einladung und QR – derselbe Ablauf wie Events.',
    tab: 'eventplan',
  },
]

export const YOGA_MUSTER_ANGEBOTE = [
  { id: 'ya-1', title: 'Hatha · Abend', note: 'Dienstag 18:30 · 75 Min.', price: '18 €', visible: true },
  { id: 'ya-2', title: 'Sanft · Vormittag', note: 'Donnerstag 9:00 · 60 Min.', price: '16 €', visible: true },
  { id: 'ya-3', title: 'Workshop Atmung', note: 'Samstag · 3 Stunden', price: '45 €', visible: false },
] as const

export const YOGA_MUSTER_TERMINE = [
  { id: 'muster-yoga-1', title: 'Hatha · Abend', date: 'Dienstag 18:30' },
  { id: 'muster-yoga-2', title: 'Sanft · Vormittag', date: 'Donnerstag 9:00' },
] as const

export const YOGA_MUSTER_STAMMDATEN = {
  auftritt: 'Yoga bei Anna',
  person: 'Anna',
  ort: 'Wels, Oberösterreich',
  oeffnung: 'Kurse nach Vereinbarung',
} as const
