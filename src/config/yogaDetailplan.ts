/**
 * Detailplan für die Yoga-Akademie Austria – Vorstellen des Projekts.
 * Kundentext: kein K2, keine Galerie-Marke.
 */

export const YOGA_DETAIL_BADGE = 'Detailplan'
export const YOGA_DETAIL_COVER_TITLE = 'Nach dem Lehrgang sichtbar bleiben'
export const YOGA_DETAIL_COVER_SLOGAN =
  'Jede Absolventin, jeder Absolvent bekommt einen eigenen Internetauftritt – mit Name, Stunden und QR.'
export const YOGA_DETAIL_COVER_TAGLINE =
  'Akademie-Website bleibt das große Haus. Der persönliche Auftritt ist das, was Schülerinnen und Schüler danach brauchen.'

export const YOGA_DETAIL_LEAD =
  'Dieser Plan beschreibt, wie die Yoga-Akademie Austria sich abhebt: Der Lehrgang endet nicht mit dem Diplom. Wer fertig ist, bleibt auffindbar – ohne eigene Website zu bauen und ohne Lernportal. Eine gemeinsame Form, viele persönliche Auftritte. Unten: Zielbild, konkrete Schritte, Pilot, Aufwand und was bewusst nicht gebaut wird.'

export type YogaDetailAbschnitt = {
  nr: string
  titel: string
  absatz: string
  punkte?: string[]
}

export const YOGA_DETAIL_ABSchnitte: YogaDetailAbschnitt[] = [
  {
    nr: '1',
    titel: 'Ausgangslage – warum sich abheben',
    absatz:
      'Viele Ausbildungen enden mit Zertifikat und einer Website der Schule. Absolvent:innen stehen danach oft ohne sichtbaren Platz im Netz da – oder müssen selbst Website, Instagram und Terminbuchung zusammenbasteln. Die Akademie will sich klar unterscheiden: Ausbildung plus sichtbares Leben danach.',
    punkte: [
      'Akademie-Website bleibt zentrale Adresse für Lehrgänge und Info.',
      'Persönlicher Auftritt kommt dazu – nicht statt der Akademie-Website.',
      'Kein zweites System (kein Lernportal, keine leeren Hüllen für hunderte Personen).',
    ],
  },
  {
    nr: '2',
    titel: 'Zielbild in einem Satz',
    absatz:
      'Wer den Lehrgang abschließt, öffnet mit wenigen Klicks ein eigenes Haus im Netz: Willkommen, nächste Stunden, Ort, Kontakt und QR – unter dem eigenen Namen. Schülerinnen und Schüler finden die Person und kommen.',
  },
  {
    nr: '3',
    titel: 'Zwei Häuser – klar getrennt',
    absatz: 'Zwei Rollen, keine Vermischung:',
    punkte: [
      'Haus der Akademie: Lehrgänge, Philosophie, Anmeldung, große Infos – wie bisher.',
      'Haus der Person: eigener Name, eigene Termine, eigener QR – nach dem Diplom (und optional schon im Lehrgang als gemeinsamer Auftritt).',
      'Daten bleiben beim jeweiligen Auftritt – nichts wird vermischt.',
    ],
  },
  {
    nr: '4',
    titel: 'Was Absolvent:innen konkret bekommen',
    absatz: 'Der persönliche Auftritt ist sofort nutzbar – nicht „irgendwann eine Website“:',
    punkte: [
      'Willkommen mit Bild, Name und kurzem Text.',
      'Stunden und Angebote (Titel, Zeit, Preis) – sichtbar für Interessierte.',
      'Ort, Kontakt, Öffnungszeiten / „nach Vereinbarung“.',
      'QR zum Teilen (Flyer, Visitenkarte, Chat) – immer der aktuelle Stand.',
      'Arbeitszentrale: Stunden pflegen, Auftritt gestalten, Listen, Termine, Einstellungen, optional Kasse.',
    ],
  },
  {
    nr: '5',
    titel: 'Was die Akademie konkret tut – Schritt für Schritt',
    absatz: 'Ein Ablauf, einmal gelernt – dann wiederholbar für jeden Lehrgang:',
    punkte: [
      'Schritt A – Lehrgang anlegen: Name, Ort, Bild, Leitung, Termine (ca. 20 Minuten Büro).',
      'Schritt B – Teilnehmerliste einspielen: dieselbe Liste, die ohnehin geführt wird.',
      'Schritt C – während der Ausbildung: gemeinsamer Lehrgang-Auftritt (QR für die Gruppe).',
      'Schritt D – Abschluss: für jede Person die eigene Fläche öffnen (Name und Bild aus der Liste).',
      'Schritt E – danach: Absolvent:in pflegt Stunden selbst; Akademie bleibt Ansprechpartnerin, nicht Webmasterin.',
    ],
  },
  {
    nr: '6',
    titel: 'Schon fertige Lehrer:innen – Einladung statt Massenanlage',
    absatz:
      'Hunderte Absolvent:innen aus früheren Jahren müssen nicht alle auf einmal ein leeres Haus bekommen. Nur wer mitmacht, öffnet ein Haus.',
    punkte: [
      'Persönliche Einladung (Link oder QR) von der Akademie.',
      'Öffnen = Opt-in: wer nicht will, bleibt ohne Auftritt.',
      'Keine 400 leeren Hüllen – kein Pflege-Alptraum.',
      'Gleiche Form wie bei aktuellen Absolvent:innen – kein Sonderweg.',
    ],
  },
  {
    nr: '7',
    titel: 'Die Arbeitszentrale – Bereiche',
    absatz: 'Dieselbe Übersicht wie ein professioneller kleiner Betrieb – mit Yoga-Wörtern:',
    punkte: [
      'Stunden & Angebote – Foto, Titel, Preis; ein Klick, und es steht im Auftritt.',
      'Auftritt gestalten und texten – Farben, Willkommen, Texte.',
      'Einstellungen – Name, Ort, Kontakt, Sicherung.',
      'Listen & Übersicht – druckbare Listen, Belegung.',
      'Termine & Medienplanung – Kurse, Einladung, QR.',
      'Optional: Kasse und Buchhaltung, wenn der Betrieb wächst.',
    ],
  },
]

export const YOGA_DETAIL_PILOT: { phase: string; ziel: string; ergebnis: string }[] = [
  {
    phase: 'Phase 1 · Pilot (ca. 2–4 Wochen)',
    ziel: 'Ein laufender oder frisch abgeschlossener Lehrgang',
    ergebnis: 'Gemeinsamer Lehrgang-Auftritt + 3–5 persönliche Muster-Auftritte mit echten Namen (freiwillig)',
  },
  {
    phase: 'Phase 2 · Abschluss-Routine',
    ziel: 'Öffnen der eigenen Fläche wird Teil des Abschlusses',
    ergebnis: 'Checkliste Büro: Liste → öffnen → QR mitgeben; Absolvent:innen können Stunden eintragen',
  },
  {
    phase: 'Phase 3 · Alumni (optional)',
    ziel: 'Einladung an frühere Absolvent:innen',
    ergebnis: 'Nur Opt-in; wachsende sichtbare Lehrer:innen-Landschaft unter dem Dach der Akademie',
  },
]

export const YOGA_DETAIL_AUFWAND: { wer: string; was: string; aufwand: string }[] = [
  { wer: 'Büro / Leitung', was: 'Lehrgang anlegen + Teilnehmerliste', aufwand: 'einmal pro Lehrgang, ca. 20–40 Min.' },
  { wer: 'Lehrende', was: 'Termine wie geplant lassen / freigeben', aufwand: 'kein Extra-Schreiben' },
  { wer: 'Teilnehmer:innen', was: 'Lehrgang-QR nutzen, später eigene Fläche öffnen', aufwand: 'wenige Minuten' },
  { wer: 'Absolvent:in danach', was: 'Stunden und Texte pflegen', aufwand: 'wie Visitenkarte aktuell halten' },
  { wer: 'Akademie IT', was: 'Kein eigenes Website-Bauen pro Person', aufwand: 'entfällt' },
]

export const YOGA_DETAIL_NICHT: string[] = [
  'Kein Lernportal und keine Kursplattform – das ist nicht das Ziel.',
  'Keine Massenanlage leerer Auftritte für alle jemals Ausgebildeten.',
  'Keine Ersetzung der Akademie-Website – sie bleibt das große Haus.',
  'Kein Zwang: wer keinen persönlichen Auftritt will, muss keinen haben.',
]

export const YOGA_DETAIL_MITBRINGEN: string[] = [
  'Kurzmappe – der kurze Pitch auf einer Seite.',
  'Dieser Detailplan – Ablauf, Pilot, Aufwand.',
  'Beispiel-Auftritt „Yoga bei Anna“ – so sieht es aus (Muster).',
  'Ansicht der Arbeitszentrale – was Absolvent:innen später selbst bedienen.',
]

export const YOGA_DETAIL_NAECHSTE: string[] = [
  'Termin mit Leitung / Büro: Pilot-Lehrgang festlegen.',
  'Teilnehmerliste und Termine für Phase 1 bereitlegen.',
  '3–5 Freiwillige für erste persönliche Auftritte gewinnen.',
  'Abschluss-Checkliste (Büro) in einem Durchgang erproben.',
  'Dann entscheiden: Routine für jeden Lehrgang + optional Alumni-Einladung.',
]
