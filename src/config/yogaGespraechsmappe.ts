/**
 * Gesprächsmappe Yoga-Akademie Austria – nach dem Telefonat als Link versenden.
 * Hier darf K2 als System vorgestellt werden (anders als Kurzmappe für Endkundinnen).
 */

export const YOGA_GESPRAECH_BADGE = 'Gesprächsmappe'
export const YOGA_GESPRAECH_COVER_TITLE = 'Nach dem Lehrgang sichtbar bleiben'
export const YOGA_GESPRAECH_COVER_SLOGAN =
  'Ein kurzer Überblick: das System dahinter – und was die Yoga-Akademie Austria damit gewinnt.'
export const YOGA_GESPRAECH_COVER_TAGLINE =
  'Zum Weiterlesen nach unserem Telefonat. Kein Verkaufsdruck – Klarheit in wenigen Minuten.'

export const YOGA_GESPRAECH_LEAD =
  'Unten steht zuerst, worauf die Technik aufbaut (ein bewährtes System für sichtbare Auftritte im Netz). Danach die konkrete Anwendung für die Akademie: Lehrgang, gemeinsamer Auftritt, eigene Fläche für Absolvent:innen – ohne die Akademie-Website zu ersetzen.'

export type YogaGespraechAbschnitt = {
  nr: string
  titel: string
  absatz: string
  punkte?: string[]
}

/** Teil A: System vorstellen */
export const YOGA_GESPRAECH_SYSTEM: YogaGespraechAbschnitt[] = [
  {
    nr: 'A1',
    titel: 'Das System in einem Satz',
    absatz:
      'K2 ist ein fertiges Arbeits- und Auftrittssystem von kgm solution: Menschen und Betriebe bekommen ein eigenes „Haus“ im Netz – Willkommen, Angebote, Kontakt, QR – plus eine klare Arbeitsfläche dahinter. Kein Basteln aus zehn Tools.',
  },
  {
    nr: 'A2',
    titel: 'Was K2 schon leistet',
    absatz: 'Im Alltag bewährt (Galerie und verwandte Bereiche):',
    punkte: [
      'Öffentlicher Auftritt: besucherfreundlich, mobil, mit aktuellem Stand.',
      'Arbeitsfläche: Inhalte pflegen, Listen, Termine, Einstellungen – eine Übersicht, ein Klick pro Aufgabe.',
      'QR und Link: immer der aktuelle Stand – zum Teilen nach einem Gespräch, auf Flyern, am Handy.',
      'Getrennte Welten: jedes Haus hat seine Daten – nichts wird vermischt.',
    ],
  },
  {
    nr: 'A3',
    titel: 'Warum das für eine Akademie passt',
    absatz:
      'Dieselbe Logik: nicht jede Absolventin baut eine eigene Website. Die Akademie öffnet die Flächen – wie ein Betrieb, der Mitglieder oder Künstler:innen sichtbar macht. Form bleibt gleich, Namen und Inhalte sind persönlich.',
  },
]

/** Teil B: Anwendung Akademie */
export const YOGA_GESPRAECH_AKADEMIE: YogaGespraechAbschnitt[] = [
  {
    nr: 'B1',
    titel: 'Zielbild für die Yoga-Akademie Austria',
    absatz:
      'Wer den Lehrgang abschließt, bleibt auffindbar: eigener Name, Stunden, Ort, Kontakt, QR. Die Akademie-Website (yogaakademieaustria.com) bleibt das große Haus. Der persönliche Auftritt kommt dazu – nicht statt dessen.',
  },
  {
    nr: 'B2',
    titel: 'Zwei Arbeitsflächen – klar getrennt',
    absatz: '',
    punkte: [
      'Fläche Akademie: Lehrgänge anlegen, Teilnehmerlisten, Gruppen-Auftritt, Abschluss öffnen, Alumni-Einladung.',
      'Fläche Absolvent:in: Stunden und Angebote pflegen, Auftritt gestalten, optional Kasse.',
      'Pro Kurs: eigene Oberfläche (Übersicht, Teilnehmer, Module, Gruppen-Auftritt, Abschluss).',
    ],
  },
  {
    nr: 'B3',
    titel: 'Ablauf in fünf Schritten',
    absatz: 'Einmal gelernt – für jeden Lehrgang wiederholbar:',
    punkte: [
      'Lehrgang anlegen (Name, Ort, Leitung, Termine).',
      'Teilnehmerliste einspielen – dieselbe Liste wie im Büro.',
      'Während der Ausbildung: gemeinsamer Gruppen-Auftritt mit QR.',
      'Abschluss: für jede Person die eigene Fläche öffnen.',
      'Danach: Absolvent:in pflegt Stunden selbst; Akademie bleibt Ansprechpartnerin, nicht Webmasterin.',
    ],
  },
  {
    nr: 'B4',
    titel: 'Schon fertige Lehrer:innen',
    absatz:
      'Keine Massenanlage leerer Häuser. Persönliche Einladung – nur wer öffnet, bekommt ein Haus. Kein Pflege-Alptraum für Hunderte.',
  },
]

export const YOGA_GESPRAECH_AUFWAND: { wer: string; was: string; aufwand: string }[] = [
  { wer: 'Büro', was: 'Lehrgang anlegen', aufwand: 'einmal, ca. 20 Minuten' },
  { wer: 'Büro', was: 'Auftritt öffnen am Abschluss', aufwand: 'Name und Bild aus der Liste' },
  { wer: 'Lehrende', was: 'Termine wie geplant', aufwand: 'kein Extra-Schreiben' },
  { wer: 'Absolvent:in', was: 'Stunden pflegen', aufwand: 'wenige Minuten bei Bedarf' },
]

export const YOGA_GESPRAECH_NAECHSTE: { titel: string; text: string }[] = [
  {
    titel: 'Beispiel-Auftritt ansehen',
    text: 'So sieht ein persönliches Haus im Netz aus (Muster).',
  },
  {
    titel: 'Fläche Akademie ansehen',
    text: 'So arbeitet das Büro: Lehrgänge, Listen, Kurs öffnen.',
  },
  {
    titel: 'Ein Kurs öffnen',
    text: 'Ein Lehrgang im Detail: Teilnehmer, Module, Abschluss.',
  },
]

export const YOGA_GESPRAECH_SCHLUSS =
  'Wenn etwas unklar bleibt: kurz melden – wir klären es in einem zweiten Gespräch oder zeigen es live. Diese Mappe ist zum ruhigen Nachlesen gedacht.'
