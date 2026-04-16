/** Nur Texte und Fokus-Keys für den VK2 Vereinsgalerie-Rundgang (Plattform) – keine App-Logik. */

export type Vk2GalerieLeitfadenStep = {
  id: string
  titel: string
  stimmung?: string
  text: string
  focusKey?: string
}

export function buildVk2GalerieLeitfadenSchritte(name: string): Vk2GalerieLeitfadenStep[] {
  const n = name.trim() || 'Besucher'
  return [
    {
      id: 'begruessung',
      titel: 'Willkommen',
      stimmung: 'So kann eine Vereinsgalerie aussehen.',
      text:
        `**Schön, dass du reinschaust, ${n}.**\n\n` +
        'Diese Seite ist ein **Beispiel** für eine **Vereins-Galerie**: Willkommensbild, **Eingangskarten** zu Bereichen, **Social Media**, optional **Termine**, **Impressum**.\n\n' +
        '**Kein Audio** – du liest in Ruhe. Mit **Weiter** Schritt für Schritt; **▼** oder **Escape** minimiert nur das Fenster.',
    },
    {
      id: 'willkommen',
      titel: 'Erster Eindruck',
      stimmung: 'Bild, Titel, Verein.',
      text:
        '**Kopfbereich:** Foto oder Farbfläche mit **Titel** und Unterzeile – so wirkt die Galerie **einladend**.\n\n' +
        'Texte und Bild pflegt der Verein im **Admin** unter Seitengestaltung und Stammdaten.',
      focusKey: 'willkommen',
    },
    {
      id: 'eingangskarten',
      titel: 'Eingangskarten',
      stimmung: 'Ein Klick pro Bereich.',
      text:
        '**Karten** führen zu Katalog, Mitgliedern, Ausstellungen – je nach dem, was der Verein eingerichtet hat.\n\n' +
        'So finden Besucher:innen **schnell** zum passenden Thema, ohne lange zu suchen.',
      focusKey: 'eingangskarten',
    },
    {
      id: 'gemeinschaft',
      titel: 'Text & Social',
      stimmung: 'Gemeinschaft zeigen.',
      text:
        '**Kurzer Text** und **Social-Links** – YouTube, Instagram oder ein Highlight-Video können hier erscheinen.\n\n' +
        'Alles optional: ohne Links bleibt ein **Hinweis**, wo im Admin nachgetragen wird.',
      focusKey: 'gemeinschaft',
    },
    {
      id: 'admin-hinweis',
      titel: 'Plattform & Admin',
      stimmung: 'Nur auf der Demo-Plattform sichtbar.',
      text:
        'Der **blaue Hinweis** erklärt: So könnte eure Vereinsgalerie aussehen – mit **Einstieg in den Admin**, wo der Verein Inhalte pflegt.\n\n' +
        'Auf einer **eigenen Lizenz-Instanz** erscheint dieser Block **nicht** für normale Besucher:innen.',
      focusKey: 'admin-hinweis',
    },
    {
      id: 'impressum',
      titel: 'Impressum & Kontakt',
      stimmung: 'Vertrauen nach außen.',
      text:
        '**Impressum** mit Vereinsname, ZVR, Adresse, E-Mail – **seriös** und nachvollziehbar.\n\n' +
        'Daneben kann ein **QR-Code** für Mitglieder angezeigt werden.',
      focusKey: 'impressum',
    },
    {
      id: 'fertig',
      titel: 'Viel Spaß beim Umschauen',
      stimmung: 'Kein Druck.',
      text:
        '**Das war der Kurz-Rundgang.** Du kannst die Seite in Ruhe erkunden.\n\n' +
        'Über **Rundgang** in der Leiste startest du die Führung **jederzeit** erneut.',
    },
  ]
}
