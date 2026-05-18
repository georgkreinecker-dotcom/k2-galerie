/**
 * K2 Familie – Zusammenfassende Geschichte: Struktur (Ideenbringer), Leitplanken, Textgerüst.
 * Eine Quelle für UI und ggf. Vorschlags-Generator (Sportwagenmodus).
 */

/** Kurz: was erlaubt / was vermeiden – Orientierung für die ganze Familie. */
export const GESCHICHTE_LEITPLANKEN: ReadonlyArray<{ titel: string; text: string }> = [
  {
    titel: 'Ton',
    text: 'Respektvoll, sachlich, warm. Keine Herabsetzung, keine Hetze. Politik und Religion gehören nicht in diese Familien-Geschichte.',
  },
  {
    titel: 'Wahrheit',
    text: 'Was aus Events und Momenten kommt, stammt aus euren Einträgen. Eigene Ergänzungen oder Vermutungen klar als „Erinnerung“ oder „Überlieferung“ kennzeichnen, wenn es keine feste Quelle ist.',
  },
  {
    titel: 'Umfang',
    text: 'Lieber mehrere kurze Abschnitte als eine endlose Seite. Jahres- oder Jahrzehnts-Kapitel erleichtern Lesen und Druck.',
  },
  {
    titel: 'Menschen',
    text: 'Namen nennen, wo es passt. Niemand bloßstellen; Verstorbene würdigen, Lebende nicht ohne Absprache bloßstellen.',
  },
  {
    titel: 'Zweige & Partner-Herkunft',
    text: 'Seitenzweige (z. B. Herkunft einer Partner:in) legt ihr als eigene Geschichte an – klarer Titel und im Rahmen-Text ein Vermerk, wen der Text betrifft. Vollständig getrennte Familie mit eigenen Rechten und Daten: eigene K2-Familie-Lizenz (eigener Mandant).',
  },
]

/** Kurzinfo für die Geschichten-Seite (organisatorische Trennung, keine Zweig-Rechte in der App). */
export const GESCHICHTE_ZWEIG_ORIENTIERUNG = {
  summary: 'Zweige & Partner-Herkunft – eigenständig ordnen',
  absaetze: [
    'In einer Familie könnt ihr mehrere Geschichten führen: z. B. Grundfamilie und Herkunft des Partners – jeweils eigener Titel, eigener Rahmen-Text, eigene Stimmen.',
    'Im Einleitungstext kurz festhalten, wen die Geschichte betrifft (z. B. „Nur Familienzweig …, nicht der Stammbaum-Kern …“). So bleibt alles übersichtlich, ohne technische Sperren.',
    'Wer komplett eigenständig arbeiten will – eigene Verwaltung, eigene Einladungen, keine gemeinsame Datenbank – braucht eine eigene K2-Familie-Lizenz mit eigenem Mandanten. Das ist die sauberste Grenze.',
  ],
  titelPlatzhalter: 'z. B. Unsere Geschichte ab 1990 oder: Herkunft Müller – nicht Stammbaum …',
} as const

/** Ideen zum Ausfüllen – keine Pflicht, nur Anregung. */
export const GESCHICHTE_IDEENBRINGER: ReadonlyArray<{ kategorie: string; stichworte: string[] }> = [
  {
    kategorie: 'Titel & Anker',
    stichworte: [
      'Ab unserer Hochzeit',
      'Seit wir uns kennen',
      'Unsere gemeinsame Zeit ab …',
      'Die Jahre mit den Kindern',
      'Nach dem Umzug',
    ],
  },
  {
    kategorie: 'Eigener Ast / Partner-Herkunft',
    stichworte: [
      'Herkunft … – nicht Stammbaum …',
      'Familienzweig … – nur dieser Ast',
      'Partner-Seite – eigenständige Erinnerungen',
      'Grundfamilie ab …',
    ],
  },
  {
    kategorie: 'Einleitung (2–4 Sätze)',
    stichworte: [
      'Wer wir in dieser Zeit waren',
      'Was uns verbindet',
      'Womit wir begannen',
      'Was sich verändert hat',
    ],
  },
  {
    kategorie: 'Übergänge zwischen Jahren',
    stichworte: [
      'Im nächsten Jahr …',
      'Einige Jahre später …',
      'Besonders in Erinnerung bleibt …',
      'Dazwischen lagen Alltag und …',
    ],
  },
  {
    kategorie: 'Abschluss',
    stichworte: [
      'Was wir mitnehmen',
      'Woran wir denken',
      'Offen für das, was kommt',
      'Gemeinsam weiter',
    ],
  },
]

/**
 * Empfohlene Gliederung als Markdown-Gerüst.
 * Platzhalter {{AB_DATUM}} und {{TITEL}} werden beim Einfügen ersetzt.
 */
export const GESCHICHTE_MARKDOWN_GERUEST = `## Titel & Anker

**Ab Datum:** {{AB_DATUM}}
**Titel dieser Geschichte:** {{TITEL}}

*(Ein Satz: Warum beginnt die Erzählung genau hier?)*



## Geltungsbereich (optional)

*(Wen betrifft diese Geschichte? z. B. „Nur Grundfamilie …“ oder „Herkunft Partner … – nicht der Stammbaum-Kern …“)*



## Einleitung

*(Kurz: Wer wir in dieser Zeit sind oder was diese Zeit für uns bedeutet.)*



## Verlauf

*(Chronologie – unten kannst du „Vorschlag aus Events & Momente“ einfügen lassen oder selbst schreiben.)*



## Menschen & Rollen

*(Optional: Wer in dieser Zeit eine besondere Rolle spielt – ohne andere herabzusetzen.)*



## Was bleibt

*(Optional: Ein Abschlusssatz oder ein Blick nach vorn.)*
`

export function fuelleGeschichteGeruest(abDatumIso: string, titelOderLeer: string): string {
  const titel = titelOderLeer.trim() || '(optional – z. B. Unsere Geschichte ab …)'
  return GESCHICHTE_MARKDOWN_GERUEST.replace('{{AB_DATUM}}', abDatumIso).replace('{{TITEL}}', titel)
}
