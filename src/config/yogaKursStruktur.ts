/**
 * Einzelner Lehrgang/Kurs – Musterdaten für die Kurs-Oberfläche.
 * Kundentext: kein K2, keine Galerie-Marke.
 */

export type YogaKursStatus = 'läuft' | 'geplant' | 'abgeschlossen'

export type YogaKursModul = {
  id: string
  titel: string
  datum: string
  ort: string
  done: boolean
}

export type YogaKursPerson = {
  id: string
  name: string
  status: 'im Lehrgang' | 'Einladung gesendet' | 'Auftritt offen'
  offen: boolean
}

export type YogaKurs = {
  id: string
  title: string
  untertitel: string
  leitung: string
  ort: string
  zeitraum: string
  stunden: string
  personen: number
  offen: number
  status: YogaKursStatus
  beschreibung: string
  module: YogaKursModul[]
  teilnehmer: YogaKursPerson[]
}

export const YOGA_KURSE: YogaKurs[] = [
  {
    id: 'lg-wels-2026',
    title: '200h Hatha · Wels',
    untertitel: 'Yogalehrer-Ausbildung · Grundausbildung',
    leitung: 'Mira',
    ort: 'Wels, Oberösterreich',
    zeitraum: 'März–Oktober 2026',
    stunden: '300 Stunden',
    personen: 18,
    offen: 3,
    status: 'läuft',
    beschreibung:
      'Berufsbegleitender Lehrgang. Gemeinsamer Gruppen-Auftritt während der Ausbildung – danach öffnet jede Person die eigene Fläche.',
    module: [
      { id: 'm1', titel: 'Modul 1 · Grundlagen & Asana', datum: '14.–16. März 2026', ort: 'Wels', done: true },
      { id: 'm2', titel: 'Modul 2 · Anatomie & Atem', datum: '25.–27. April 2026', ort: 'Wels', done: true },
      { id: 'm3', titel: 'Modul 3 · Philosophie & Meditation', datum: '13.–15. Juni 2026', ort: 'Wels', done: false },
      { id: 'm4', titel: 'Modul 4 · Unterricht & Praxis', datum: '12.–14. September 2026', ort: 'Wels', done: false },
      { id: 'm5', titel: 'Abschluss · Prüfung & Öffnen', datum: '17.–18. Oktober 2026', ort: 'Wels', done: false },
    ],
    teilnehmer: [
      { id: 't-anna', name: 'Anna', status: 'Auftritt offen', offen: true },
      { id: 't-mira', name: 'Mira L.', status: 'Einladung gesendet', offen: false },
      { id: 't-lea', name: 'Lea', status: 'im Lehrgang', offen: false },
      { id: 't-tom', name: 'Tom', status: 'im Lehrgang', offen: false },
      { id: 't-sara', name: 'Sara', status: 'Auftritt offen', offen: true },
    ],
  },
  {
    id: 'lg-graz-modul',
    title: 'Wochenendmodul · Graz',
    untertitel: 'Aufbaumodul · 4 Wochenenden',
    leitung: 'Elena',
    ort: 'Graz, Steiermark',
    zeitraum: '2026',
    stunden: '4 Module',
    personen: 12,
    offen: 0,
    status: 'geplant',
    beschreibung: 'Kompakte Wochenenden. Gruppe bekommt einen gemeinsamen QR, sobald der Kurs startet.',
    module: [
      { id: 'g1', titel: 'Wochenende 1', datum: 'Termin folgt', ort: 'Graz', done: false },
      { id: 'g2', titel: 'Wochenende 2', datum: 'Termin folgt', ort: 'Graz', done: false },
      { id: 'g3', titel: 'Wochenende 3', datum: 'Termin folgt', ort: 'Graz', done: false },
      { id: 'g4', titel: 'Wochenende 4 · Abschluss', datum: 'Termin folgt', ort: 'Graz', done: false },
    ],
    teilnehmer: [
      { id: 'g-a', name: 'Alex', status: 'im Lehrgang', offen: false },
      { id: 'g-b', name: 'Kim', status: 'im Lehrgang', offen: false },
    ],
  },
]

export function getYogaKurs(id: string): YogaKurs | undefined {
  return YOGA_KURSE.find((k) => k.id === id)
}

export function yogaKursPath(id: string): string {
  return `/projects/k2-yoga/kurs/${encodeURIComponent(id)}`
}
